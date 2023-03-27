import {buildClient} from './client';

exports.getProjects = async ({connection}) => {
    const client = await buildClient(connection);
    const {data: {projects}} = await client.cloudresourcemanager.projects.list();
    return projects?.map(({projectId, name}) => ({
        id: projectId,
        label: name,
    })) ?? [];
};

exports.getMLJobs = async ({connection, parameters}) => {
    const client = await buildClient(connection);
    const {data: {jobs}} = await client.ml.projects.jobs.list(parameters.project);
    return jobs?.map((job) => ({
        id: job.jobId,
        label: job.jobId,
    })) ?? [];
};

exports.getDataFlowJobs = async ({connection, parameters}) => {
    const client = await buildClient(connection);
    const {data: {jobs}} = await client.dataflow.projects.locations.jobs.list(parameters.project, parameters.region);
    const view = {view: 'JOB_VIEW_DESCRIPTION'};

    // Fetch all jobs to verify if they have the templateLocation property in displayData (Only clonable jobs have it)
    const jobsWithTemplateLocation = await Promise.all(jobs.map(async (job) => {
        const {data: {pipelineDescription: {displayData}}} = await client.dataflow.projects.locations.jobs.get(parameters.project, parameters.region, job.id, view);
        const templateLocation = displayData.find((data) => data.key === 'templateLocation');
        if (templateLocation) {
            return {
                id: job.id,
                label: job.name,
            };
        }
    }));

    return jobsWithTemplateLocation?.filter((job) => job);
};

const getRegions = async (projectLocationsClient, project) => {
    const {data: {locations}} = await projectLocationsClient.list(project);
    return locations?.map(({locationId}) => ({
        id: locationId,
        label: locationId,
    })) ?? [];
};

exports.getDatafusionRegions = async ({connection, parameters}) => {
    const client = await buildClient(connection);
    return getRegions(client.datafusion.projects.locations, parameters.project);
};

exports.getRunRegions = async ({connection, parameters}) => {
    const client = await buildClient(connection);
    return getRegions(client.run.projects.locations, parameters.project);
};

exports.getFunctionsRegions = async ({connection, parameters}) => {
    const client = await buildClient(connection);
    return getRegions(client.cloudfunctions.projects.locations, parameters.project);
};

exports.getDatafusionInstances = async ({connection, parameters}) => {
    const client = await buildClient(connection);
    const {data: {instances}} = await client.datafusion.projects.locations.instances.list(parameters.project, parameters.region);
    return instances?.map(({displayName, name}) => ({
        id: name,
        label: displayName
    })) ?? [];
};

exports.getBatchPipelines = async ({connection, parameters}) => {
    const client = await buildClient(connection);
    const {data} = await client.get(`${parameters.apiEndpoint}/v3/namespaces/default/apps?artifactName=cdap-data-pipeline`);
    return data?.map(({name}) => ({
        id: name,
        label: name,
    })) ?? [];
};

exports.getRealtimePipelines = async ({connection, parameters}) => {
    const client = await buildClient(connection);
    const {data} = await client.get(`${parameters.apiEndpoint}/v3/namespaces/default/apps?artifactName=cdap-data-streams`);
    return data?.map(({name}) => ({
        id: name,
        label: name,
    })) ?? [];
};

exports.getBuckets = async ({connection, parameters}) => {
    const client = await buildClient(connection);
    const {data: {items: buckets}} = await client.storage.buckets.list(parameters.project);
    return buckets?.map(({id, name}) => ({
        id,
        label: name,
    })) ?? [];
};

exports.getFunctions = async ({connection, parameters}) => {
    const client = await buildClient(connection);
    const {data: {functions}} = await client.cloudfunctions.projects.locations.functions.get(parameters.project, parameters.region);
    return functions?.map(({name}) => {
        let arrName = name.split("/")
        return {id: name, label: arrName[arrName.length - 1]}
    }) ?? [];
};

exports.getServices = async ({connection, parameters}) => {
    const client = await buildClient(connection);
    const {data: {items: services}} = await client.cloudRun.list(parameters.project, parameters.region);
    return services?.map((service) => ({
        id: service.metadata.selfLink,
        label: service.metadata.name
    })) ?? [];
};

exports.getKubeflowPipelines = async ({connection, parameters}) => {
    const client = await buildClient(connection);
    const {data: {pipelines}} = await client.get(`${parameters.instanceUrl}/apis/v1beta1/pipelines`);
    return pipelines?.map(({id, name}) => ({
        id,
        label: name,
    })) ?? [];
};

exports.getKubeflowPipelineVersions = async ({connection, parameters}) => {
    const client = await buildClient(connection);
    const {data: {versions}} = await client.get(`${parameters.instanceUrl}/apis/v1beta1/pipeline_versions?resource_key.type=PIPELINE&resource_key.id=${parameters.pipeline}`);
    return versions?.map(({id, name}) => ({
        id,
        label: name,
    })) ?? [];
};


exports.getKubeflowExperiments = async ({connection, parameters}) => {
    const client = await buildClient(connection);
    const {data: {experiments}} = await client.get(`${parameters.instanceUrl}/apis/v1beta1/experiments`);
    return experiments.map(({id, name}) => ({
        id,
        label: name,
    })) ?? [];
};

exports.getKubeflowRuns = async ({connection, parameters}) => {
    const client = await buildClient(connection);
    const {data: {runs}} = await client.get(`${parameters.instanceUrl}/apis/v1beta1/runs`);
    const filteredRuns = runs.filter((run) => {
        const {resource_references: resourceReferences} = run;
        const runExperiment = resourceReferences.find((resource) => resource?.key?.type === 'EXPERIMENT');
        const runPipelineVersion = resourceReferences.find((resource) => resource?.key?.type === 'PIPELINE_VERSION');
        return runExperiment?.key?.id === parameters.experiment && runPipelineVersion?.key?.id === parameters.pipelineVersion;
    });
    return filteredRuns?.map(({id, name, ...runData}) => ({
        id,
        label: name,
        data: runData,
    })) ?? [];
};

