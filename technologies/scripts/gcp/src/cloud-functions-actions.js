import {buildClient} from './client';
import {JobStatus} from './JobStatus';

exports.start = async ({connection, parameters}) => {
    const client = await buildClient(connection);
    let payload = {};
    if (parameters.payload) {
        try {
            payload = JSON.parse(parameters.payload);
        } catch (e) {
            throw Error(`Invalid JSON as payload of the cloud functions: ${e.message}`);
        }
    }
    const functionTmp = parameters.function.split('/')
    const functionName = functionTmp[functionTmp.length - 1]
    const response = await client.cloudfunctions.callFunctions(parameters.region, parameters.project, functionName, payload);
    return {data: response.data, headers: response.headers};
};

exports.getStatus = async ({payload}) => {
    return payload.data.errorMessage ? JobStatus.FAILED : JobStatus.SUCCEEDED;
};

exports.getLogs = async ({payload}) => {
    const timestamp = Date.parse(payload.headers.date);
    return [{
        timestamp: isNaN(timestamp) ? new Date().getTime() : timestamp,
        log: payload.data,
    }];
};
