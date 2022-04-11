import {buildClient} from './client'
import {JobStatus} from './JobStatus'

exports.start = async ({connection, parameters}) => {
    const client = buildClient(connection);
    const {data: jobDefinitions} = await client.batch.describeJobDefinitions([parameters.jobDefinition]);
    const {data} = await client.batch.submitJob({
        jobDefinition: parameters.jobDefinition,
        jobName: `${jobDefinitions.jobDefinitions[0].jobDefinitionName}`,
        jobQueue: parameters.jobQueue
    });
    return {jobId: data.jobId};
};

exports.stop = async ({connection, payload}) => {
    const client = buildClient(connection);
    await client.batch.terminateJob(payload.jobId);
};

const STATUS_MAPPING = {
    SUBMITTED: JobStatus.REQUESTED,
    PENDING: JobStatus.QUEUED,
    RUNNABLE: JobStatus.QUEUED,
    STARTING: JobStatus.RUNNING,
    RUNNING: JobStatus.RUNNING,
    SUCCEEDED: JobStatus.SUCCEEDED,
    FAILED: JobStatus.FAILED,
};

exports.getStatus = async ({connection, payload}) => {
    const client = buildClient(connection);
    const {data} = await client.batch.describeJobs([payload.jobId]);
    return STATUS_MAPPING[data.jobs[0].status];
};

exports.getLogs = async ({connection, payload}) => {
    const client = buildClient(connection);
    const {data} = await client.batch.describeJobs([payload.jobId]);
    const logStreamName = data?.jobs?.[0]?.attempts?.[data?.jobs?.[0]?.attempts?.length - 1]?.container?.logStreamName;
    return client.getLogsStream('/aws/batch/job', logStreamName);
};
