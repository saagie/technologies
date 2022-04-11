import {buildClient} from './client';

exports.getPipelines = async ({connection}) => {
    const client = await buildClient(connection);
    const {data: {pipelines}} = await client.getPipelines();
    return pipelines?.map(({id, name}) => ({
        id,
        label: name,
    })) ?? [];
};

exports.getPipelineVersions = async ({connection, parameters}) => {
    const client = await buildClient(connection);
    const {data: {versions}} = await client.getPipelineVersions(parameters.pipeline);
    return versions?.map(({id, name}) => ({
        id,
        label: name,
    })) ?? [];
};

exports.getExperiments = async ({connection}) => {
    const client = await buildClient(connection);
    const {data: {experiments}} = await client.getExperiments();
    return experiments?.map(({id, name}) => ({
        id,
        label: name,
    })) ?? [];
};

exports.getRuns = async ({connection, parameters}) => {
    const client = await buildClient(connection);
    const {data: {runs}} = await client.getRuns();
    return runs
        ?.filter((run) => {
            const {resource_references: resourceReferences} = run;
            const runExperiment = resourceReferences.find((resource) => resource?.key?.type === EXPERIMENT_LABEL);
            const runPipelineVersion = resourceReferences.find((resource) => resource?.key?.type === PIPELINE_VERSION_LABEL);
            return runExperiment?.key?.id === parameters.experiment && runPipelineVersion?.key?.id === parameters.pipelineVersion;
        })
        ?.map(({id, name, ...runData}) => ({
            id,
            label: name,
            data: runData, // TODO remove extra data
        })) ?? [];
};
