import {buildClient} from './client';
import {JobStatus} from './JobStatus';

exports.start = async ({connection, parameters}) => {
    const client = buildClient(connection);
    const {data} = await client.glue.startJobRun(parameters.job);
    return {glueJobId: data.JobRunId};
};

exports.stop = async ({connection, parameters, payload}) => {
    const client = buildClient(connection);
    await client.glue.batchStopJobRun(parameters.job, payload.glueJobId);
};

const STATUS_MAPPING = {
    RUNNING: JobStatus.RUNNING,
    STOPPED: JobStatus.KILLED,
    SUCCEEDED: JobStatus.SUCCEEDED,
    STARTING: JobStatus.QUEUED,
    FAILED: JobStatus.FAILED,
    STOPPING: JobStatus.KILLING,
    TIMEOUT: JobStatus.FAILED,
};

exports.getStatus = async ({connection, parameters, payload}) => {
    const client = buildClient(connection);
    const {data} = await client.glue.getJobRun({JobName: parameters.job, RunId: payload.glueJobId});
    return STATUS_MAPPING[data.JobRun.JobRunState] || JobStatus.AWAITING;
};

exports.getLogs = async ({connection, payload}) => {
    const client = buildClient(connection);
    return client.getLogsStream('/aws-glue/jobs/output', payload.glueJobId);
};
