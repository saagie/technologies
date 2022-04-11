import {buildClient} from './client';
import {JobStatus} from './JobStatus';

exports.start = async ({connection, parameters}) => {
    const client = await buildClient(connection);
    const {data} = await client.management.createRunPipeline(parameters.resourceGroup, parameters.factory.label, parameters.pipeline.label);
    return {
        runId: data.runId,
    };
};

exports.stop = async ({connection, parameters, payload}) => {
    const client = await buildClient(connection);
    await client.management.cancelRunPipeline(parameters.resourceGroup, parameters.factory.label, payload.runId);
};

const STATUS_MAPPING = {
    'Queued': JobStatus.QUEUED,
    'Canceling': JobStatus.KILLING,
    'Cancelled': JobStatus.KILLED,
    'InProgress': JobStatus.RUNNING,
    'Succeeded': JobStatus.SUCCEEDED,
    'Failed': JobStatus.FAILED,
};

exports.getStatus = async ({connection, parameters, payload}) => {
    const client = await buildClient(connection);
    const {data} = await client.management.getRunPipeline(parameters.resourceGroup, parameters.factory.label, payload.runId);
    return STATUS_MAPPING[data.status] || JobStatus.AWAITING;
};

exports.reRun = async ({connection, parameters}) => {
  const client = await buildClient(connection);
  const {data} = await client.management.reRunPipeline(parameters.resourceGroup, parameters.factory.label, parameters.pipeline.label, parameters.pipelineRun);
  return {
    runId: data.runId,
  };
};
