import * as axios from 'axios';
import { URLSearchParams } from 'url';
import buildUrl from 'axios/lib/helpers/buildURL';
import combineURLs from 'axios/lib/helpers/combineURLs';
import isAbsoluteURL from 'axios/lib/helpers/isAbsoluteURL';
import axiosHttp from 'axios/lib/adapters/http';
import {Readable} from 'stream';
import {sign} from './aws4';
import {XMLParser} from 'fast-xml-parser/src/fxp';

const xmlParser = new XMLParser();

const getTransformer = (config) => {
    const {transformRequest} = config;

    if (transformRequest) {
        if (typeof transformRequest === 'function') {
            return transformRequest;
        } else if (transformRequest.length) {
            return transformRequest[0];
        }
    }

    throw new Error('Could not get default transformRequest function from Axios defaults');
};

const aws4Interceptor = (options, credentials) => {
    return async (config) => {
        if (!config.url) {
            throw new Error('No URL present in request config, unable to sign request');
        }

        if (config.params) {
            config.url = buildUrl(config.url, config.params, config.paramsSerializer);
            delete config.params;
        }

        let url = config.url;

        if (config.baseURL && !isAbsoluteURL(config.url)) {
            url = combineURLs(config.baseURL, config.url);
        }

        const {host, pathname, search} = new URL(url);
        const {data, headers, method} = config;

        const transformRequest = getTransformer(config);

        const transformedData = transformRequest(data, headers);

        // Remove all the default Axios headers
        const {
            common,
            delete: _delete, // 'delete' is a reserved word
            get,
            head,
            post,
            put,
            patch,
            ...headersToSign
        } = headers;

        const signingOptions = {
            method: method && method.toUpperCase(),
            host,
            path: pathname + search,
            region: options?.region,
            service: options?.service,
            signQuery: options?.signQuery,
            body: transformedData,
            headers: headersToSign,
        };

        sign(signingOptions, credentials);

        config.headers = signingOptions.headers;

        console.log("Signed headers:", JSON.stringify(config.headers, null, 2));

        if (signingOptions.signQuery) {
            const originalUrl = new URL(config.url);
            const signedUrl = new URL(originalUrl.origin + signingOptions.path);
            config.url = signedUrl.toString();
        }

        return config;
    };
};

const requestHttp = async (client, method, url, params, data, headers, options) => {
    console.log("Request", method, "to", url);
    if (headers) {
        console.log("Request Headers", headers);
    }
    if (params) {
        console.log("Request Params", params);
    }
    if (data) {
        console.log("Request Data", data);
    }
    let response;
    try {
        response = await client.request({
            method,
            url,
            data,
            params,
            headers,
            ...options
        });
    } catch (e) {
        const message = e.response?.data?.message ?? e.response?.data?.Message ?? e.message;
        if (e.response) {
            console.log('HTTP error:', e.response.status, e.response.statusText, e.response.data);
            if (e.response.status === 403) {
                throw new Error(`Bad credentials: ${message}`, { code: e.response.status, cause: e });
            }
            if (e.response.status === 401) {
                throw new Error(`Not authorized to execute the operation: ${message}`, { code: e.response.status, cause: e });
            }
            throw new Error(`Unexpected HTTP error ${e.response.status}: ${message}`, { code: e.response.status, cause: e });
        }
        throw new Error(`Unexpected HTTP error: ${message}`, { cause: e });
    }
    console.log('Response Status', response.status, response.statusText);
    console.log('Response Headers', response.headers);
    console.log('Response Data', response.data);
    return response;
};

const awsRegionalRestCall = async (client, connection, service, method, path, paramsOrData, headers) => {
    const url = `https://${service}.${connection.region}.amazonaws.com/${path}`;
    let params = method === 'GET' ? paramsOrData : null;
    let data = method !== 'GET' ? paramsOrData : null;
    return requestHttp(client, method, url, params, data, headers);
};

const awsRestCall = async (client, connection, service, version, action, data, headers) => {
    const url = `https://${service}.amazonaws.com/`;
    return requestHttp(client, 'POST', url, null, new URLSearchParams({...data, Action: action, Version: version}), headers);
};

const awsHeaderCall = async (client, connection, contentTypeVersion, domain, service, action, data) => {
    const url = `https://${domain}.${connection.region}.amazonaws.com/`;
    return requestHttp(client, 'POST', url, null, JSON.stringify(data ?? {}), {
        'X-Amz-Target': `${service}.${action}`,
        'Content-Type': `application/x-amz-json-${contentTypeVersion}`,
    });
};

const awsBatch = (client, connection, action, data) => awsRegionalRestCall(client, connection, 'batch', 'POST', `v1/${action.toLowerCase()}`, data);
const awsEmr = (client, connection, action, data) => awsHeaderCall(client, connection, '1.1', 'elasticmapreduce', 'ElasticMapReduce', action, data);
const awsGlue = (client, connection, action, data) => awsHeaderCall(client, connection, '1.1', 'glue', 'AWSGlue', action, data);
const awsLambda = (client, connection, method, path, data, headers) => awsRegionalRestCall(client, connection, 'lambda', method, `2015-03-31/${path}`, data, headers);
const awsSageMaker = (client, connection, action, data) => awsHeaderCall(client, connection, '1.1', 'api.sagemaker', 'SageMaker', action, data);
const awsStepFunctions = (client, connection, action, data) => awsHeaderCall(client, connection, '1.0', 'states', 'AWSStepFunctions', action, data);
const awsS3 = (client, connection, bucket, method, path, data, options) => requestHttp(client, method, `https://${bucket}.s3.${connection.region}.amazonaws.com/${path}`, null, data, {}, options);
const awsCloudWatchLogs = (client, connection, action, data) => awsHeaderCall(client, connection, '1.1', 'logs', 'Logs_20140328', action, data);
const awsIam = (client, connection, action, data) => awsRestCall(client, connection, 'iam', '2010-05-08', action, data);
const awsSts = (client, connection, action, data) => awsRestCall(client, connection, 'sts', '2011-06-15', action, data);

const getLogsStream = (client, connection, action, nextTokenReponseField, logParams) => {
    if (!logParams.logStreamName && !logParams.logStreamNamePrefix) {
        console.log('No logs available');
        return [];
    }
    let logs = null;
    let logIndex = 0;
    let last = false;
    return new Readable({
        objectMode: true,
        async read() {
            while (logs === null || logIndex >= logs.events.length) {
                if (last) {
                    this.push(null);
                    return;
                }
                const {data} = await awsCloudWatchLogs(client, connection, action, {
                    nextToken: logs?.[nextTokenReponseField],
                    ...logParams
                });
                last = data[nextTokenReponseField] === logs?.[nextTokenReponseField];
                logs = data;
                logIndex = 0;
            }
            const event = logs.events[logIndex];
            logIndex += 1;
            this.push({
                timestamp: event.timestamp ?? event.ingestionTime ?? new Date().getTime(),
                log: event.message
            });
        }
    });
};

export const buildClient = (connection) => {
    const interceptor = aws4Interceptor({}, {
        accessKeyId: connection.aws_access_key_id,
        secretAccessKey: connection.aws_secret_access_key,
    });
    const client = axios.create({adapter: axiosHttp});
    client.interceptors.request.use(interceptor);

    return {
        batch: {
            describeJobDefinitions(jobDefinitions) {
                return awsBatch(client, connection, 'DescribeJobDefinitions', {jobDefinitions});
            },
            describeJobQueues() {
                return awsBatch(client, connection, 'DescribeJobQueues');
            },
            describeJobs(jobs) {
                return awsBatch(client, connection, 'DescribeJobs', {jobs});
            },
            submitJob(params) {
                return awsBatch(client, connection, 'SubmitJob', params);
            },
            terminateJob(jobId) {
                return awsBatch(client, connection, 'TerminateJob', {
                    jobId,
                    reason: 'Terminating job from Saagie.'
                });
            },
        },
        cloudWatch: {
            describeLogStreams(params) {
                return awsCloudWatchLogs(client, connection, 'DescribeLogStreams', params);
            },
            getLogEvents(params) {
                return awsCloudWatchLogs(client, connection, 'GetLogEvents', params);
            },
        },
        emr: {
            addJobFlowSteps(params) {
                return awsEmr(client, connection, 'AddJobFlowSteps', params);
            },
            cancelSteps(params) {
                return awsEmr(client, connection, 'CancelSteps', params);
            },
            describeCluster(clusterId) {
                return awsEmr(client, connection, 'DescribeCluster', {ClusterId: clusterId});
            },
            describeStep(params) {
                return awsEmr(client, connection, 'DescribeStep', params);
            },
            listClusters() {
                return awsEmr(client, connection, 'ListClusters');
            },
            listSteps(clusterId) {
                return awsEmr(client, connection, 'ListSteps', {ClusterId: clusterId});
            },
        },
        glue: {
            batchStopJobRun(name, runId) {
                return awsGlue(client, connection, 'BatchStopJobRun', {
                    JobName: name,
                    JobRunIds: [runId]
                });
            },
            getCrawler(name) {
                return awsGlue(client, connection, 'GetCrawler', {Name: name});
            },
            getCrawlers() {
                return awsGlue(client, connection, 'GetCrawlers');
            },
            getJobRun(params) {
                return awsGlue(client, connection, 'GetJobRun', params);
            },
            getJobs() {
                return awsGlue(client, connection, 'GetJobs');
            },
            getWorkflowRun(name, runId) {
                return awsGlue(client, connection, 'GetWorkflowRun', {Name: name, RunId: runId});
            },
            listWorkflows() {
                return awsGlue(client, connection, 'ListWorkflows');
            },
            startCrawler(name) {
                return awsGlue(client, connection, 'StartCrawler', {Name: name});
            },
            startJobRun(name) {
                return awsGlue(client, connection, "StartJobRun", {JobName: name});
            },
            startWorkflowRun(name) {
                return awsGlue(client, connection, 'StartWorkflowRun', {Name: name});
            },
            stopCrawler(name) {
                return awsGlue(client, connection, 'StopCrawler', {Name: name});
            },
        },
        iam: {
            getUser() {
                return awsIam(client, connection, 'GetUser');
            }
        },
        lambda: {
            getEventSourceMapping(uuid) {
                return awsLambda(client, connection, 'GET', 'event-source-mappings', {UUID: uuid});
            },
            invoke(functionName, args) {
                return awsLambda(client, connection, 'POST', `functions/${functionName}/invocations`, args);
            },
            listEventSourceMappings(name) {
                return awsLambda(client, connection, 'GET', 'event-source-mappings', {FunctionName: name});
            },
            listFunctions() {
                return awsLambda(client, connection, 'GET', 'functions');
            },
            updateEventSourceMapping(uuid, params) {
                return awsLambda(client, connection, 'PUT', `event-source-mappings/${uuid}`, params);
            },
        },
        s3: {
            getObject(bucket, path) {
                return awsS3(client, connection, bucket, 'GET', path, null, {responseType: 'stream'});
            },
            async listObjectsV2(bucket, prefix) {
                const {data} = await awsS3(client, connection, bucket, 'GET', '', {'list-type': '2', prefix});
                return {data: xmlParser.parse(data)};
            },
        },
        sageMaker: {
            createTrainingJob(params) {
                return awsSageMaker(client, connection, 'CreateTrainingJob', params);
            },
            describeTrainingJob(name) {
                return awsSageMaker(client, connection, 'DescribeTrainingJob', {TrainingJobName: name});
            },
            listTrainingJobs() {
                return awsSageMaker(client, connection, 'ListTrainingJobs');
            },
            stopTrainingJob(name) {
                return awsSageMaker(client, connection, 'StopTrainingJob', {TrainingJobName: name});
            },
        },
        stepFunctions: {
            describeExecution(arn) {
                return awsStepFunctions(client, connection, 'DescribeExecution', {executionArn: arn});
            },
            describeStateMachineForExecution(arn) {
                return awsStepFunctions(client, connection, 'DescribeStateMachineForExecution', {executionArn: arn});
            },
            listStateMachines() {
                return awsStepFunctions(client, connection, 'ListStateMachines');
            },
            startExecution(params) {
                return awsStepFunctions(client, connection, 'StartExecution', params);
            },
            stopExecution(arn) {
                return awsStepFunctions(client, connection, 'StopExecution', {
                    executionArn: arn,
                    cause: 'Terminating job from Saagie.'
                });
            },
        },
        sts: {
            getCallerIdentity() {
                return awsSts(client, connection, 'GetCallerIdentity');
            }
        },
        getLogsStream(logGroupName, logStreamName) {
            return getLogsStream(client, connection, 'GetLogEvents', 'nextForwardToken', {
                logGroupName,
                logStreamName
            });
        },
        getFilteredLogsStream(logGroupName, logStreamNamePrefix) {
            return getLogsStream(client, connection, 'FilterLogEvents', 'nextToken', {
                logGroupName,
                logStreamNamePrefix
            });
        },
    }
};
