import {buildClient} from './client';
import {JobStatus} from './JobStatus';

exports.start = async ({connection, parameters, payload}) => {
    const client = buildClient(connection);
    const {data} = await client.runScenario(parameters.project, parameters.scenario);
    return {
        jobId: data.id,
        triggerId: data.trigger && data.trigger.id,
        runId: data.runId,
    };
};

exports.stop = async ({connection, parameters, payload}) => {
    const client = buildClient(connection);
    await client.abortScenario(parameters.project, parameters.scenario);
    return {
        ok: true
    }
};

const STATUS_MAPPING = {
    'SUCCESS': JobStatus.SUCCEEDED,
    'FAILED': JobStatus.FAILED,
    'ABORTED': JobStatus.KILLED
};

exports.getStatus = async ({connection, parameters, payload}) => {
    const client = buildClient(connection);
    const {data} = await client.getLightScenario(parameters.project, parameters.scenario);
    if (data && data.running) {
        return JobStatus.RUNNING;
    }
    const {data: runTriggerData} = await client.getScenarioRunForTrigger(parameters.project, parameters.scenario, payload.triggerId, payload.runId);
    return STATUS_MAPPING[runTriggerData?.scenarioRun?.result?.outcome] || JobStatus.AWAITING;
};
