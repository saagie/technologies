import {buildClient} from './client';
import {JobStatus} from './JobStatus';

exports.start = async ({connection, parameters}) => {
    const client = buildClient(connection);
    let payload;
    try {
        payload = JSON.parse(parameters.payload);
    } catch (e) {
        throw Error(`Invalid JSON as payload of the lambda: ${e.message}`);
    }
    const response = await client.lambda.invoke(parameters.functions, payload);
    return {data: response.data, headers: response.headers};
};

exports.getStatus = async ({payload}) => {
    return payload.data.errorMessage ? JobStatus.FAILED : JobStatus.SUCCEEDED;
};

exports.getLogs = async ({payload}) => {
    return [{
        date: payload.headers.date,
        log: payload.data.errorMessage ?? payload.data.body
    }];
};
