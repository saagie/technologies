import {buildClient} from './client';
import {JobStatus} from './JobStatus';

exports.stop = async ({connection, payload}) => {
    const client = await buildClient(connection);
    await client.terminateRun(payload.run.id);
};

const STATUS_MAPPING = {
    'Running': JobStatus.RUNNING,
    'Succeeded': JobStatus.SUCCEEDED,
    'Failed': JobStatus.FAILED,
    'Error': JobStatus.FAILED,
    'Skipped': JobStatus.KILLED,
};

exports.getStatus = async ({connection, payload}) => {
    const client = await buildClient(connection);
    const {data} = await client.getRun(payload.run.id);
    return STATUS_MAPPING[data.run.status] || JobStatus.AWAITING;
};

exports.getLogs = async ({connection, payload}) => {
    const client = await buildClient(connection);
    const {data} = await client.getRun(payload.run.id);
    const workflowJson = data.pipeline_runtime.workflow_manifest;
    const workflowObj = JSON.parse(workflowJson);
    const {nodes} = workflowObj.status;
    const nodesArray = Object.values(nodes);
    const pods = nodesArray.filter(node => node.type === 'Pod');
    pods.sort((a, b) => new Date(a.startedAt) - new Date(b.startedAt));
    const logsPromises = pods.map(async (pod) => {
        let logsData = '';
        try {
            const {data} = await client.getPodLogs(pod.id);
            if (data) {
                logsData = data;
            }
        } catch (e) {
            console.warn(`Error while getting logs for pod = ${pod.id}`);
        }
        return logsData;
    });
    const logs = await Promise.all(logsPromises);
    const logsLines = logs.reduce((acc, logData) => {
        return acc.concat(logData.split('\n'));
    }, []);
    return logsLines.map(log => Log(log));
};
