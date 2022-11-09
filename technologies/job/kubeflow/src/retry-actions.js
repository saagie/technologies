const {buildClient} = require("./client");

exports.start = async ({connection, parameters}) => {
    const client = await buildClient(connection);
    const {data} = await client.retryRun(parameters.run);
    return data;
};
