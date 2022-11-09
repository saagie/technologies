import {buildClient} from './client';
import {JobStatus} from './JobStatus';

exports.start = async ({connection, parameters}) => {
    const client = await buildClient(connection);
    const {data} = await client.createJob(parameters.project, {
        outputs: [
            {
                projectKey: parameters.project,
                id: parameters.dataset
            }
        ]
    });
    return {jobId: data.id};
};

exports.stop = async ({connection, parameters, payload}) => {
    const client = buildClient(connection);
    await client.abortJob(parameters.project, payload.jobId);
    return {
            ok: true
        }
};

const STATUS_MAPPING = {
    'NOT_STARTED': JobStatus.QUEUED,
    'RUNNING': JobStatus.RUNNING,
    'FAILED': JobStatus.FAILED,
    'ABORTED': JobStatus.KILLED,
    'DONE': JobStatus.SUCCEEDED
};

exports.getStatus = async ({connection, parameters, payload}) => {
    const client = await buildClient(connection);
    const {data} = await client.getJob(parameters.project, payload.jobId);
    return STATUS_MAPPING[data.baseStatus.state] || JobStatus.AWAITING;
};

exports.getLogs = async ({connection, parameters, payload}) => {
    const client = await buildClient(connection);
    const {data} = await client.getJobLog(parameters.project, payload.jobId);
    const logsLines = data.split('\n');
    return logsLines.filter((logLine => !!logLine))
                    .map((logLine) => ({log: logLine, timestamp: (new Date()).getTime()}));
};
