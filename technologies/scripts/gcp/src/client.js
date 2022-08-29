import * as axios from 'axios';
import axiosHttp from 'axios/lib/adapters/http';
import * as crypto from "crypto";

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
        const message = e.response?.data?.error_description ?? e.response?.data?.error?.message ?? e.message;
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

const oauthConnect = async (client, gcpKey, claims) => {
    const jtwHeader = {'alg': 'RS256', 'typ': 'JWT'};
    const iat = Math.floor(Date.now() / 1000);
    const jwtClaims = {
        iss: gcpKey.client_email,
        sub: gcpKey.client_email,
        aud: "https://www.googleapis.com/oauth2/v4/token",
        exp: iat + (60 * 60),
        iat,
        ...claims
    };
    const jwtContent =
        Buffer.from(JSON.stringify(jtwHeader), 'utf-8').toString('base64url')
        + '.'
        + Buffer.from(JSON.stringify(jwtClaims), 'utf-8').toString('base64url');
    const jwtSign = crypto.createSign('RSA-SHA256');
    jwtSign.update(jwtContent);
    let jwtSignature ;
    try {
        jwtSignature = jwtSign.sign(gcpKey.private_key);
    } catch (e) {
        throw Error(`Invalid private key in the JSON key: ${e.message}`, {cause: e});
    }
    const jwtToken = jwtContent + '.' + jwtSignature.toString('base64url');
    const {data} = await requestHttp(client, 'POST', 'https://www.googleapis.com/oauth2/v4/token', null, {
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwtToken
    });
    return data;
}

export const buildClient = async (connection) => {
    const client = axios.create({adapter: axiosHttp});

    let gcpKey;
    try {
        gcpKey = JSON.parse(connection.jsonKey);
    } catch (e) {
        throw Error(`Invalid JSON key: ${e.message}`, {cause: e});
    }

    let accessToken = null;
    if (gcpKey.type === "service_account") {
        const data = await oauthConnect(client, gcpKey, {scope: 'https://www.googleapis.com/auth/cloud-platform'});
        accessToken = data.access_token;
    } else if (gcpKey.type === "authorized_user") {
        const {data} = await requestHttp(client, 'POST', 'https://oauth2.googleapis.com/token', null, {
            client_id: gcpKey.client_id,
            client_secret: gcpKey.client_secret,
            refresh_token: gcpKey.refresh_token,
            grant_type: 'refresh_token'
        });
        accessToken = data.access_token;
    } else {
        throw Error(`Unsupported type of JSON key: ${gcpKey.type} (only 'service_account' or 'authorized_user' is supported)`);
    }

    const headers = {
        Authorization: `Bearer ${accessToken}`
    };

    const call = (name, method, path, params, data) => requestHttp(client, method, `https://${name}.googleapis.com/${path}`, params, data, headers);
    const regionalCall = (name, region, method, path, params, data) => requestHttp(client, method, `https://${region}-${name}.googleapis.com/${path}`, params, data, headers);

    const callCloudFunctions = async (region, projectName, functionName, data) => {
        const functionUrl = `https://${region}-${projectName}.cloudfunctions.net/${functionName}`;
        const idTokenData = await oauthConnect(client, gcpKey, {"target_audience": functionUrl});
        return requestHttp(client, 'POST', functionUrl, null, data, {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idTokenData.id_token}`
        });
    };

    const callCloudDataFusion = (method, action, apiEndpoint, pipeline, path) => requestHttp(client, method, `${apiEndpoint}/v3/namespaces/default/apps/${pipeline}/${path}/${action}`, null, null, headers);
    const callCloudDataPrep = (method, url, path, data) => requestHttp(client, method, `${url}/${path}`, null, data, headers);
    const callKubeflow = (method, instanceUrl, path, params, data) => requestHttp(client, method, `${instanceUrl}/${path}`, params, data, headers);

    return {
        cloudDataFusion: {
            start(apiEndpoint, pipeline, path) {
                return callCloudDataFusion('POST', 'start', apiEndpoint, pipeline, path);
            },
            stop(apiEndpoint, pipeline, path) {
                return callCloudDataFusion('POST', 'stop', apiEndpoint, pipeline, path);
            },
            getRuns(apiEndpoint, pipeline, path) {
                return callCloudDataFusion('GET', 'runs', apiEndpoint, pipeline, path);
            },
            getLogs(apiEndpoint, pipeline, path) {
                return callCloudDataFusion('GET', 'logs', apiEndpoint, pipeline, path);
            },
        },
        cloudDataPrep: {
            createJobGroup(url, data) {
                return callCloudDataPrep('POST', url, `v4/jobGroups`, data);
            },
            getJobGroup(url, jobGroupId) {
                return callCloudDataPrep('GET', url, `v4/jobGroups/${jobGroupId}`);
            },
        },
        // NB: the nesting of useless properties is just here to imitate the google sdk, so that code can be easily converted
        cloudfunctions: {
            callFunctions(region, projectName, functionName, data){
                return callCloudFunctions(region, projectName, functionName, data)
            },
            projects: {
                locations: {
                    list(project) {
                        return call('cloudfunctions', 'GET', `v1/projects/${project}/locations`);
                    },
                    functions: {
                        get(project, region) {
                            return call('cloudfunctions', 'GET', `v1/projects/${project}/locations/${region}/functions`);
                        },
                    }
                }
            }
        },
        cloudresourcemanager: {
            projects: {
                list() {
                    return call('cloudresourcemanager', 'GET', 'v1/projects');
                },
            },
        },
        cloudRun: {
            run(region, project, data) {
                return regionalCall('run', region, 'POST', `apis/serving.knative.dev/v1/namespaces/${project}/services`, null, data);
            },
            delete(region, selfLink) {
                return regionalCall('run', region, 'DELETE', selfLink);
            },
            get(region, selfLink) {
                return regionalCall('run', region, 'GET', selfLink);
            },
            list(project, region) {
                return regionalCall('run', region, 'GET', `apis/serving.knative.dev/v1/namespaces/${project}/services`);
            },
        },
        dataflow: {
            projects: {
                locations: {
                    templates: {
                        launch(project, region, options, data) {
                            return call('dataflow', 'POST', `v1b3/projects/${project}/locations/${region}/templates:launch`, options, data);
                        },
                        get(project, region, options) {
                            return call('dataflow', 'GET', `v1b3/projects/${project}/locations/${region}/templates:get`, options);
                        },
                    },
                    jobs: {
                        get(project, region, job, options) {
                            return call('dataflow', 'GET', `v1b3/projects/${project}/locations/${region}/jobs/${job}`, options);
                        },
                        update(project, region, job, data) {
                            return call('dataflow', 'PUT', `v1b3/projects/${project}/locations/${region}/jobs/${job}`, null, data);
                        },
                        list(project, region){
                            return call('dataflow', 'GET', `v1b3/projects/${project}/locations/${region}/jobs`);
                        },
                    }
                }
            }
        },
        datafusion: {
            projects: {
                locations: {
                    instances: {
                        list(project, region) {
                            return call('datafusion', 'GET', `v1/projects/${project}/locations/${region}/instances`);
                        },
                        get(project, region, instance) {
                            return call('datafusion', 'GET', `v1/projects/${project}/locations/${region}/instances/${instance}`);
                        },
                    },
                    list(project) {
                        return call('datafusion', 'GET', `v1/projects/${project}/locations`);
                    },
                },
            },
        },
        kubeflow: {
            create(instanceUrl, data) {
                return callKubeflow('POST', instanceUrl, 'POST', 'apis/v1beta1/runs', null, data);
            },
            get(instanceUrl, run) {
                return callKubeflow(instanceUrl, 'GET', `apis/v1beta1/runs/${run}`);
            },
            retry(instanceUrl, run) {
                return callKubeflow(instanceUrl, 'POST', `apis/v1beta1/runs/${run}/retry`);
            },
            terminate(instanceUrl, run) {
                return callKubeflow(instanceUrl, 'POST', `apis/v1beta1/runs/${run}/terminateterminate`);
            },
        },
        logging: {
            entries: {
                list(data) {
                    return call('logging', 'POST', 'v2/entries:list', null, data);
                },
            }
        },
        ml: {
            projects: {
                jobs: {
                    create(project, data) {
                        return call('ml', 'POST', `v1/projects/${project}/jobs`, null, data);
                    },
                    cancel(project, job) {
                        return call('ml', 'POST', `v1/projects/${project}/jobs/${job}/cancel`);
                    },
                    get(project, job) {
                        return call('ml', 'GET', `v1/projects/${project}/jobs/${job}`);
                    },
                    list(project) {
                        return call('ml', 'GET', `v1/projects/${project}/jobs`);
                    },
                }
            }
        },
        run: {
            projects: {
                locations: {
                    list(project) {
                        return call('run', 'GET', `v1/projects/${project}/locations`);
                    },
                },
            },
        },
        storage: {
            buckets: {
                list(project) {
                    return call('storage', 'GET', 'storage/v1/b', {project});
                },
            }
        },
        storagetransfer: {
            transferOperations: {
                list(options) {
                    return call('storagetransfer', 'GET', 'v1/transferOperations', options);
                },
                cancel(name) {
                    return call('storagetransfer', 'POST', `v1/transferOperations/${name}/cancel`);
                },
            },
            transferJobs: {
                create(data) {
                    return call('storagetransfer', 'POST', 'v1/transferJobs', null, data);
                },
            },
        },
        async getLogs(data) {
            const resLogging = await this.logging.entries.list(data);
            return resLogging?.data?.entries
                ?.reverse()
                ?.map(({timestamp, protoPayload, jsonPayload, textPayload}) => {
                    let newTimestamp = Date.parse(timestamp);
                    let logContent = textPayload;
                    if (jsonPayload?.levelname && jsonPayload?.message) {
                        logContent = `[${jsonPayload.levelname}] - ${jsonPayload.message}`;
                    } else if (jsonPayload?.message) {
                        logContent = jsonPayload.message;
                    } else if (protoPayload?.status?.message){
                        logContent = protoPayload.status.message;
                    }
                    return {log: logContent, timestamp:newTimestamp};
                }).filter((logContent) => logContent.log) ?? [];
        }
    };
};
