import {buildClient} from './client';

exports.start = async ({connection, parameters}) => {
    const client = buildClient(connection);
    const pipelineSpec = {
        pipeline_id: parameters.pipeline,
    };
    if (parameters.run.data.pipeline_spec.parameters) {
        pipelineSpec.parameters = parameters.run.data.pipeline_spec.parameters;
    }
    const {data} = await client.createRun({
        name: parameters.runName,
        description: parameters.runDescription || parameters.run.data.description,
        pipeline_spec: pipelineSpec,
    });
    return data;
};
