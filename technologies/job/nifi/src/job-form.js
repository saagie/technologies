import {buildClient} from './client';

exports.getProcessGroups = async ({connection}) => {
    const client = buildClient(connection);
    const {data: processgroups} = await client.getProcessGroups();
    if (!processgroups || !processgroups.status) {
        return [];
    }
    return [{
        id: processgroups.status.id,
        label: processgroups.status.name,
    }];
};
