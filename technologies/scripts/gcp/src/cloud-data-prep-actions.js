import {buildClient} from './client';
import {JobStatus} from './JobStatus';

exports.start = async ({connection, parameters}) => {
    const client = await buildClient(connection);
    const {data} = await client.cloudDataPrep.createJobGroup(parameters.url, {
        wrangledDataset: {
            id: parseInt(job.featuresValues.datasetID),
        }
    });
    return {jobGroupId: data.id};
};

const STATUS_MAPPING = {
    'Created': JobStatus.QUEUED,
    'Pending': JobStatus.QUEUED,
    'InProgress': JobStatus.RUNNING,
    'Complete': JobStatus.SUCCEEDED,
    'Canceled': JobStatus.KILLED,
    'Failed': JobStatus.FAILED,
};

exports.getStatus = async ({connection, parameters, payload}) => {
    const client = await buildClient(connection);
    const {data} = await client.cloudDataPrep.getJobGroup(parameters.url, payload.jobGroupId);
    return STATUS_MAPPING[data.status] || JobStatus.AWAITING;
};
