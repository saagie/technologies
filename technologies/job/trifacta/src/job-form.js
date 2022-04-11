import {buildClient} from './client';

exports.getFlows = async ({connection}) => {
    const client = buildClient(connection);
    const result = await client.getFlows();
    const flows = result?.data?.data;
    if (!flows || !flows.length) {
        return [];
    }
    return flows.map(({name, id}) => ({
        id,
        label: name,
    }));
};

exports.getDatasets = async ({connection}) => {
    const client = buildClient(connection);
    const result = await client.getWrangledDatasets();
    const datasets = result?.data?.data;
    if (!datasets || !datasets.length) {
        return [];
    }
    return datasets
        .filter((dataset) => dataset.flow.id === connection.flow)
        .map(({name, id}) => ({
            id,
            label: name,
        }));
};

exports.getPlans = async ({connection}) => {
    const client = buildClient(connection);
    const result = await client.getPlans();
    const plans = result?.data?.data;
    if (!plans || !plans.length) {
        return [];
    }
    return plans.map(({name, id}) => ({
        id,
        label: name,
    }));
};
