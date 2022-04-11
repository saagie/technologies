import {buildClient} from './client';

exports.getBatchJobs = async ({connection}) => {
    const client = buildClient(connection);
    const {data} = await client.batch.describeJobDefinitions();
    return data?.jobDefinitions
        ?.filter(({status}) => status === 'ACTIVE')
        ?.map(({jobDefinitionArn, jobDefinitionName}) => ({
            id: jobDefinitionArn,
            label: jobDefinitionName,
        })) ?? [];
};

exports.getBatchJobQueues = async ({connection}) => {
    const client = buildClient(connection);
    const {data} = await client.batch.describeJobQueues();
    return data?.jobQueues?.map(({jobQueueName, jobQueueArn}) => ({
        id: jobQueueArn,
        label: jobQueueName,
    })) ?? [];
};

exports.getClusters = async ({connection}) => {
    const client = buildClient(connection);
    const {data} = await client.emr.listClusters();
    return data?.Clusters
        ?.filter((cluster) => cluster.Status.State !== 'TERMINATED')
        ?.map(({Id, Name}) => ({
            id: Id,
            label: Name,
        })) ?? [];
};

exports.getSteps = async ({connection, parameters}) => {
    const client = buildClient(connection);
    const {data} = await client.emr.listSteps(parameters.clusters);
    return data?.Steps?.map(({Id, Name}) => ({
        id: Id,
        label: Name,
    })) ?? [];
};

exports.getCrawlers = async ({connection}) => {
    const client = buildClient(connection);
    const {data} = await client.glue.getCrawlers();
    return data?.Crawlers?.map(({Name}) => ({
        id: Name,
        label: Name,
    })) ?? [];
};

exports.getGlueJobs = async ({connection}) => {
    const client = buildClient(connection);
    const {data} = await client.glue.getJobs();
    return data?.Jobs?.map(({Name}) => ({
        id: Name,
        label: Name,
    })) ?? [];
};

exports.getWorkflows = async ({connection}) => {
    const client = buildClient(connection);
    const {data} = await client.glue.listWorkflows();
    return data?.Workflows?.map((value) => ({
        id: value,
        label: value,
    })) ?? [];
};

exports.getFunctions = async ({connection}) => {
    const client = buildClient(connection);
    const {data} = await client.lambda.listFunctions();
    return data?.Functions?.map(({FunctionName}) => ({
        id: FunctionName,
        label: FunctionName,
    })) ?? [];
};

exports.getTrainingJobs = async ({connection}) => {
    const client = buildClient(connection);
    const {data} = await client.sageMaker.listTrainingJobs();
    return data?.TrainingJobSummaries?.map(({TrainingJobName}) => ({
        id: TrainingJobName,
        label: TrainingJobName,
    })) ?? [];
};

exports.getStateMachines = async ({connection}) => {
    const client = buildClient(connection);
    const {data} = await client.stepFunctions.listStateMachines();
    return data?.stateMachines?.map(({stateMachineArn, name}) => ({
        id: stateMachineArn,
        label: name,
    })) ?? [];
};
