import {buildClient} from './client';
import {JobStatus} from './JobStatus';

const STATUS_MAPPING = {
    'ACTIVE': JobStatus.RUNNING,
    'OFFLINE': JobStatus.FAILED,
    'DEPLOY_IN_PROGRESS': JobStatus.AWAITING,
};

exports.getStatus = async ({connection, parameters}) => {
    const client = await buildClient(connection);
    const {data} = await client.cloudfunctions.projects.locations.functions.get({
        name: parameters.function,
    });

    return STATUS_MAPPING[data.status] || JobStatus.KILLED;
};

exports.getLogs = async ({connection, parameters}) => {
    const client = await buildClient(connection);
    return await client.getLogs({
        requestBody: {
            filter: `resource.type=cloud_function resource.labels.function_name=${parameters.function.label} resource.labels.region=${parameters.region} log_name=projects/${parameters.project}/logs/cloudfunctions.googleapis.com%2Fcloud-functions`,
            orderBy: "timestamp desc",
            resourceNames: [`projects/${parameters.project}`]
        },
    });
};
