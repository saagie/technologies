import {buildClient} from './client';

exports.getResourceGroups = async ({connection}) => {
    const client = await buildClient(connection);
    const {data} = await client.management.getResourceGroups();
    return data?.value?.map(({id, name}) => ({
        id,
        label: name
    })) ?? [];
};

exports.getFactories = async ({connection, parameters}) => {
    const client = await buildClient(connection);
    const {data} = await client.management.getFactories(parameters.resourceGroup);
    return data?.value?.map(({id, name}) => ({
        id,
        label: name
    })) ?? [];
}

exports.getPipelines = async ({connection, parameters}) => {
    const client = await buildClient(connection);
    const {data} = await client.management.getPipelines(parameters.resourceGroup, parameters.factory.label)
    return data?.value?.map(({id, name}) => ({
        id,
        label: name
    })) ?? [];
};

exports.getPipelinesRuns = async ({connection, parameters}) => {
    const client = await buildClient(connection);
    const {data} = await client.management.getPipelineRuns(parameters.resourceGroup, parameters.factory.label, {
        lastUpdatedAfter: dayjs().subtract(1, 'year').format(),
        lastUpdatedBefore: dayjs().format(),
        filters: [
            {
                operand: "PipelineName",
                operator: "Equals",
                values: [
                    featuresValues.pipeline.label
                ]
            }
        ]
    });
    return data?.value?.map(({runId, runStart, pipelineName}) => ({
        id: runId,
        label: `${pipelineName} - ${dayjs(runStart).format('YYYY-MM-DD HH:mm:ss')}`
    })) ?? [];
};

exports.getWorkspaces = async ({connection, parameters}) => {
    const client = await buildClient(connection);
    const {data} = await client.management.getWorkspaces(parameters.resourceGroup);
    return data?.value?.map(({id, name, properties}) => ({
        id,
        url: properties.workspaceUrl,
        label: name
    })) ?? [];
};

const getAllNotebooksRecursively = async (client, path, parameters) => {
    const {data: {objects}} = await client.databricks.listWorkspace(parameters.workspace.url, {path});

    if (objects) {
        const notebooks = objects.filter((obj) => obj.object_type === 'NOTEBOOK');
        const directories = objects.filter((obj) => obj.object_type === 'DIRECTORY');

        const notebooksFromDirectories = await Promise.all(
            directories.map(async (dir) => await getAllNotebooksRecursively(client, dir.path, featuresValues))
        );

        return [
            ...notebooks,
            ...notebooksFromDirectories.flat()
        ];
    }

    return [];
}

exports.getNotebooks = async ({connection, parameters}) => {
    const client = await buildClient(connection);
    const notebooks = await getAllNotebooksRecursively(client, '/', parameters);
    return notebooks?.map(({object_id, path}) => ({
        id: object_id,
        label: path
    })) ?? [];
};

exports.getJobs = async ({connection, parameters}) => {
    const client = await buildClient(connection);
    const {data} = await client.databricks.getWorkspaceJobs(parameters.workspace);
    return data?.jobs?.map(({job_id, settings}) => ({
        id: job_id,
        label: settings.name,
    })) ?? [];
};

exports.getFunctionApps = async ({connection, parameters}) => {
    const client = await buildClient(connection);
    const {data} = await client.management.getFunctionApps(parameters.resourceGroup);
    return data?.value
        ?.filter((webApp) => webApp.kind === 'functionapp')
        ?.map(({id, name}) => ({
            id,
            label: name
        })) ?? [];
};

exports.getFunctions = async ({connection, parameters}) => {
    const client = await buildClient(connection);
    const {data} = await client.management.getFunctions(parameters.functionApp);
    return data?.value?.map(({id, name, properties}) => ({
        id,
        label: name,
        functionName: properties.name,
        triggerUrl: properties.invoke_url_template
    })) ?? [];
};

exports.getExperiments = async ({connection, parameters}) => {
    const client = await buildClient(connection);
    const {data} = client.experiments.getExperiments(parameters.workspace.properties.discoveryUrl, parameters.resourceGroup.label, parameters.workspace.label);
    return data?.value?.map(({experimentId, name}) => ({
        id: experimentId,
        label: name
    })) ?? [];
};

exports.getDatasets = async ({connection, parameters}) => {
    const client = await buildClient(connection);
    const {data} = client.experiments.getDatasets(parameters.workspace.properties.discoveryUrl, parameters.resourceGroup.label, parameters.workspace.label);
    return data?.value?.map(({datasetId, name, latest}) => ({
        id: datasetId,
        label: name,
        savedId: latest.savedDatasetId,
    })) ?? [];
};

exports.getDatasetColumns = async ({connection, parameters}) => {
    const client = await buildClient(connection);
    const {data} = client.experiments.getDatasetColumns(parameters.workspace.properties.discoveryUrl, parameters.resourceGroup.label, parameters.workspace.label, parameters.dataset.savedId);
    const datasetPreview = JSON.parse(data.quickPreviewResult);
    return datasetPreview.schema.map(({id}) => ({
        id,
        label: id
    })) ?? [];
};

exports.getComputes = async ({connection, parameters}) => {
    const client = await buildClient(connection);
    const {data} = client.management.getComputes(parameters.resourceGroup.label, parameters.workspace.label);
    return data?.value
        ?.filter((compute) => compute && compute.properties && compute.properties.computeType === 'AmlCompute')
        ?.map(({id, name, properties}) => ({
            id,
            label: name,
            properties,
        })) ?? [];
};

exports.getMLPipelinesRuns = async ({connection, parameters}) => {
    const client = await buildClient(connection);
    const {data} = await client.regional.getMLPipelineRuns(parameters.workspace.properties.discoveryUrl, parameters.resourceGroup.label, parameters.workspace.label);
    return data?.value?.map(({id, runNumber, experimentName, experimentId}) => ({
        id,
        label: `Run ${runNumber} - Run ID : ${id} - Experiment : ${experimentName}`,
        experimentId
    })) ?? [];
};
