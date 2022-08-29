import {buildClient} from './client';
import {JobStatus} from './JobStatus';

exports.startNew = async ({connection, parameters}) => {
    const client = await buildClient(connection);
    const pipelineSpec = {pipeline_id: parameters.pipeline};
    if (parameters.runParameters) {
        pipelineSpec.parameters = JSON.parse(parameters.runParameters);
    }
    const {data} = await client.kubeflow.create(parameters.instanceUrl, {
        name: parameters.runName,
        description: parameters.runDescription,
        pipeline_spec: pipelineSpec,
    });
    return data;
};

exports.startClone = async ({connection, parameters}) => {
    const client = await buildClient(connection);
    const pipelineSpec = {pipeline_id: parameters.run.data.pipeline_spec.pipeline_id};

    let runParameters = null;
    if (parameters.runParameters) {
        runParameters = JSON.parse(parameters.runParameters);
    }

    if (runParameters || parameters.run.data.pipeline_spec.parameters) {
        pipelineSpec.parameters = runParameters || parameters.run.data.pipeline_spec.parameters;
    }

    const {data} = await client.kubeflow.create(parameters.instanceUrl, {
        name: parameters.runName,
        description: parameters.runDescription || parameters.run.data.description,
        pipeline_spec: pipelineSpec,
    });

    return data;
};

exports.startRetry = async ({connection, parameters}) => {
    const client = await buildClient(connection);
    const {data} = await client.kubeflow.retry(parameters.instanceUrl, parameters.run);
    return data;
};

exports.stop = async ({connection, parameters}) => {
    const client = await buildClient(connection);
    await client.kubeflow.terminate(parameters.instanceUrl, parameters.run);
};

const STATUS_MAPPING = {
    'Running': JobStatus.RUNNING,
    'Succeeded': JobStatus.SUCCEEDED,
    'Failed': JobStatus.FAILED,
    'Error': JobStatus.FAILED,
    'Skipped': JobStatus.KILLED,
};

exports.getStatus = async ({connection, parameters}) => {
    const client = await buildClient(connection);
    const {data} = await client.kubeflow.get(parameters.instanceUrl, parameters.run);
    return STATUS_MAPPING[data.run.status] || JobStatus.AWAITING;
};

exports.getLogs = async ({connection, parameters}) => {
    const client = await buildClient(connection);

    const {data} = await client.kubeflow.get(parameters.instanceUrl, parameters.run);
    const manifest = JSON.parse(data.run.pipeline_spec.workflow_manifest);
    const podName = manifest.metadata.generateName;

    return await client.getLogs({
        requestBody: {
            filter: `resource.type="k8s_container" resource.labels.pod_name:"${podName}"`,
            orderBy: "timestamp desc",
            resourceNames: [`projects/${parameters.project}`]
        }
    });
};
