import {buildClient} from './client';
import {JobStatus} from './JobStatus';

const start = async (path, connection, parameters) => {
    const client = await buildClient(connection);
    const {data: instance} = await client.datafusion.projects.locations.instances.get(parameters.project, parameters.region, parameters.instance);
    await client.cloudDataFusion.start(instance.apiEndpoint, parameters.pipeline, path);
    return true;
};

const stop = async (path, connection, parameters) => {
    const client = await buildClient(connection);
    const {data: instance} = await client.datafusion.projects.locations.instances.get(parameters.project, parameters.region, parameters.instance);
    await client.cloudDataFusion.stop(instance.apiEndpoint, parameters.pipeline, path);
};

const STATUS_MAPPING = {
    'KILLED': JobStatus.KILLED,
    'FAILED': JobStatus.FAILED,
    'COMPLETED': JobStatus.SUCCEEDED,
    'RUNNING': JobStatus.RUNNING,
    'PROVISIONNING': JobStatus.RUNNING,
};

const getStatus = async (path, connection, parameters) => {
    const client = await buildClient(connection);
    const {data: instance} = await client.datafusion.projects.locations.instances.get(parameters.project, parameters.region, parameters.instance);
    const {data: runs} = await client.cloudDataFusion.getRuns(instance.apiEndpoint, parameters.pipeline, path);
    if (runs && runs.length > 0 && runs[0]) {
        return STATUS_MAPPING[runs[0].status] || JobStatus.AWAITING;
    }
    return JobStatus.AWAITING;
};

const getLogs = async (path, connection, parameters) => {
    const client = await buildClient(connection);
    const {data: instance} = await client.datafusion.projects.locations.instances.get(parameters.project, parameters.region, parameters.instance);
    const {data} = await client.cloudDataFusion.getLogs(instance.apiEndpoint, parameters.pipeline, path);
    const logs = data.split('\n');
    return logs.map(log => Log(log));
};

exports.startBatch = ({connection, parameters}) => start('workflows/DataPipelineWorkflow', connection, parameters);
exports.stopBatch = ({connection, parameters}) => stop('workflows/DataPipelineWorkflow', connection, parameters);
exports.getStatusBatch = ({connection, parameters}) => getStatus('workflows/DataPipelineWorkflow', connection, parameters);
exports.getLogsBatch = ({connection, parameters}) => getLogs('workflows/DataPipelineWorkflow', connection, parameters);

exports.startRealtime = async ({connection, parameters}) => start('spark/DataStreamsSparkStreaming', connection, parameters);
exports.stopRealtime = ({connection, parameters}) => stop('spark/DataStreamsSparkStreaming', connection, parameters);
exports.getStatusRealtime = ({connection, parameters}) => getStatus('spark/DataStreamsSparkStreaming', connection, parameters);
exports.getLogsRealtime = ({connection, parameters}) => getLogs('spark/DataStreamsSparkStreaming', connection, parameters);
