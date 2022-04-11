import {buildClient} from './client';

exports.checkConnection = async ({connection}) => {
    const client = buildClient(connection);
    await client.iam.getUser();
    return true;
};
