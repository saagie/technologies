import {buildClient} from './client';

exports.getProjects = async ({connection}) => {
    const client = buildClient(connection);
    const {data: projects} = await client.getProjects();
    return projects?.map(({name, projectKey}) => ({
        id: projectKey,
        label: name,
    })) ?? [];
};

exports.getScenarios = async ({connection, parameters}) => {
    const client = buildClient(connection);
    const {data: datasets} = await client.getScenarios(parameters.project);
    return datasets?.map(({id, name}) => ({
        id,
        label: name,
    })) ?? [];
};

exports.getDatasets = async ({connection, parameters}) => {
    const client = buildClient(connection);
    const {data: datasets} = await client.getDatasets(parameters.project);
    return datasets?.map(({name}) => ({
        id: name,
        label: name,
    })) ?? [];
};
