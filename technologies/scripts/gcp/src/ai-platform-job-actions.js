import {buildClient} from './client';
import {JobStatus} from './JobStatus';

exports.start = async ({connection, parameters}) => {
    const client = await buildClient(connection);
    const {data} = await client.ml.projects.jobs.create({
        parent: `projects/${parameters.project}`,
        requestBody: {
            jobId: parameters.newJobName,
            trainingInput: parameters.job.data && parameters.job.data.trainingInput,
            trainingOutput: parameters.job.data && parameters.job.data.trainingOutput,
            predictionInput: parameters.job.data && parameters.job.data.predictionInput,
            predictionOutput: parameters.job.data && parameters.job.data.predictionOutput,
        }
    });
    return data;
};

exports.stop = async ({connection, parameters, payload}) => {
    const client = await buildClient(connection);
    await client.ml.projects.jobs.cancel({
        name: `projects/${parameters.project}/jobs/${payload.jobId}`,
    });
};

const STATUS_MAPPING = {
    'QUEUED': JobStatus.QUEUED,
    'PREPARING': JobStatus.QUEUED,
    'RUNNING': JobStatus.RUNNING,
    'SUCCEEDED': JobStatus.SUCCEEDED,
    'FAILED': JobStatus.FAILED,
    'CANCELLING': JobStatus.KILLING,
    'CANCELLED': JobStatus.KILLED
};

exports.getStatus = async ({connection, parameters, payload}) => {
    const client = await buildClient(connection);
    const {data} = await client.ml.projects.jobs.get({
        name: `projects/${parameters.project}/jobs/${payload.jobId}`,
    });
    return STATUS_MAPPING[data.state] || JobStatus.AWAITING;
};

exports.getLogs = async ({connection, parameters, payload}) => {
    const client = await buildClient(connection);
    return await client.getLogs({
        requestBody: {
            filter: `resource.labels.job_id="${payload.jobId}"`,
            orderBy: "timestamp desc",
            resourceNames: [`projects/${parameters.project}`]
        },
    });
};
