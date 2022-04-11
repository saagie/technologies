import {buildClient} from './client';
import {JobStatus, StatusMapping} from './JobStatus';

exports.start = async ({connection, parameters}) => {
    const client = buildClient(connection);
    const {data: {planSnapshotRunId}} = await client.createPlan(parameters.plan);
    return {planSnapshotRunId, planId: parameters.plan};
};

exports.getStatus = async ({connection, payload}) => {
    const client = buildClient(connection);
    const {data: {status}} = await client.getPlanSnapshotRuns(payload.planSnapshotRunId);
    return StatusMapping[status] || JobStatus.AWAITING;
};

exports.getLogs = async ({connection, payload}) => {
    const client = buildClient(connection);
    let logsLines = [];
    let logsPromises = [];

    const {data} = await client.getPlanDetails(payload.planId);

    const {planSnapshots: {data: planSnapshotsData}} = data;

    if (planSnapshotsData && planSnapshotsData.length > 0) {
        const lastPlanSnapshot = planSnapshotsData[0];

        const {data: planSnapshotData} = await client.getPlanDetails(lastPlanSnapshot.id);

        const {planNodes: {data: planNodesData}} = planSnapshotData;

        planNodesData.forEach((planNode) => {
            const {planTaskSnapshotRuns} = planNode;

            const {data: planTaskSnapshotRunsData} = planTaskSnapshotRuns;

            const planTaskSnapshotRunCorrespondingToRun = planTaskSnapshotRunsData.find(
                (planTaskSnapshotRun) => planTaskSnapshotRun.planSnapshotRun.id === instance.payload.planSnapshotRunId
            );

            const {planFlowTaskRunResults: {data: planFlowTaskRunResultsData}} = planTaskSnapshotRunCorrespondingToRun;

            logsPromises = logsPromises.concat(planFlowTaskRunResultsData.map(async (flowTaskRun) => {
                const {jobGroup} = flowTaskRun;
                const {data: logsData} = await client.getJobGroupLogs(jobGroup.id);
                logsLines = logsLines.concat(await extractLogs(logsData, jobGroup.id));
            }));

        });

        await Promise.all(logsPromises);
    }

    return logsLines.map((line) => {
        const logDate = line.substring(0, 23);
        const logContent = line.substring(24);
        return Log(logContent, Stream.STDOUT, logDate);
    });
};
