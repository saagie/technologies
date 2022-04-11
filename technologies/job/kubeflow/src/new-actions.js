import {buildClient} from './client';

exports.start = async ({connection, parameters}) => {
    const client = await buildClient(connection);
    const pipelineSpec = {
        pipeline_id: parameters.pipeline,
    };
    if (parameters.runParameters) {
        pipelineSpec.parameters = JSON.parse(parameters.runParameters);
    }
    const {data} = await client.createRun({
        name: parameters.runName,
        description: parameters.runDescription,
        pipeline_spec: pipelineSpec,
        resource_references: [
            {
                key: {
                    id: parameters.experiment,
                    type: 'EXPERIMENT',
                },
                relationship: 'OWNER',
            },
            {
                key: {
                    id: parameters.pipelineVersion,
                    type: 'PIPELINE_VERSION',
                },
                relationship: 'CREATOR',
            }
        ],
    });
    return data;
};
