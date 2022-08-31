import {buildClient} from './client';
import {JobStatus} from './JobStatus';

exports.start = async ({connection, parameters}) => {
    const client = buildClient(connection);
    const {data} = await client.glue.startWorkflowRun(parameters.workflow);
    return {glueWorkflowId: data.RunId};
};

exports.getStatus = async ({connection, parameters, payload}) => {
    const client = buildClient(connection);
    const {data} = await client.glue.getWorkflowRun(parameters.workflow, payload.glueWorkflowId);
    switch (data.Run.Status) {
        case 'RUNNING':
            return JobStatus.RUNNING;
        case 'COMPLETED':
            return JobStatus.SUCCEEDED;
    }
};
