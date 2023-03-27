import {buildClient} from './client';

exports.checkConnection = async ({connection}) => {
    const client = await buildClient(connection);
    await client.getProjects();
    return {
        ok: true
    };
};