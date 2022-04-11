import {buildClient} from './client';
import {JobStatus} from './JobStatus';

exports.start = async ({connection, parameters}) => {
    const client = buildClient(connection);
    const {data} = await client.stepFunctions.startExecution({
        stateMachineArn: parameters.stateMachine,
        name: parameters.name,
        input: parameters.input
    });
    return {executionId: data.executionArn};
};

exports.stop = async ({connection, payload}) => {
    const client = buildClient(connection);
    await client.stepFunctions.stopExecution(payload.executionId);
};

const STATUS_MAPPING = {
    RUNNING: JobStatus.RUNNING,
    SUCCEEDED: JobStatus.SUCCEEDED,
    ABORTED: JobStatus.KILLED,
    TIMED_OUT: JobStatus.FAILED,
    FAILED: JobStatus.FAILED,
};

exports.getStatus = async ({connection, payload}) => {
    const client = buildClient(connection);
    const {data} = await client.stepFunctions.describeExecution(payload.executionId);
    return STATUS_MAPPING[data.status];
};

exports.getLogs = async ({connection, payload}) => {
    const client = buildClient(connection);
    const {data} = await client.stepFunctions.describeStateMachineForExecution(payload.executionId);
    const logGroupNameArn = data?.loggingConfiguration?.destinations?.[0]?.cloudWatchLogsLogGroup?.logGroupArn;
    if (!logGroupNameArn) {
        console.log("No logs available");
        return [];
    }
    const logGroupName = logGroupNameArn.split(":")[6];
    const {data: logstream} = await client.cloudWatch.describeLogStreams({
        logGroupName: logGroupName,
        descending: true,
        limit: '1',
        orderBy: 'LastEventTime'
    });

    return client.getLogsStream(logGroupName, logstream.logStreams[0].logStreamName);
};
