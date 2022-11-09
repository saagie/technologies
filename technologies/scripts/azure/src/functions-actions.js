import {buildClient} from './client';
import {JobStatus} from './JobStatus';

exports.start = async ({connection, parameters}) => {
    const client = await buildClient(connection);
    const {data} = await client.management.editFunctionState(parameters.function, {properties: 'enabled'});
    return data;
};

exports.stop = async ({connection, parameters}) => {
    const client = await buildClient(connection);
    await client.management.editFunctionState(parameters.function, {properties: 'disabled'});
};

exports.getStatus = async ({connection, parameters}) => {
    const client = await buildClient(connection);
    const {data} = await client.management.getFunction(parameters.function);
    return data?.properties?.isDisabled ? JobStatus.KILLED : JobStatus.RUNNING;
};

exports.getLogs = async ({connection, parameters}) => {
    const client = await buildClient(connection);
    const {data: {value: allRequests}} = await client.insights.getRequests();
    const {data: {value: allLogs}} = await client.insights.getTraces();

    const requestsForFunction = allRequests.filter((req) => req.request.name === parameters.function.functionName);
    const functionLogs = allLogs.filter((log) => (
        requestsForFunction.some((req) => req.request.id === (log.operation && log.operation.parentId))
    ));

    return functionLogs.map(({timestamp, trace, customDimensions}) =>
        Log(`[${customDimensions && customDimensions.LogLevel}] ${trace.message}`, Stream.STDOUT, timestamp));
};
