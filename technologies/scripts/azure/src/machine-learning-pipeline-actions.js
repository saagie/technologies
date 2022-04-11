import {buildClient} from './client';
import {JobStatus} from './JobStatus';

exports.start = async ({connection, parameters}) => {
    const client = await buildClient(connection);

    let runParameters = null;
    if (parameters.parameters && parameters.parameters.length > 0) {
        runParameters = JSON.parse(parameters.parameters);
    }

    const {data} = await client.regional.rerunMLPipeline(
        parameters.workspace.properties.discoveryUrl,
        parameters.resourceGroup.label,
        parameters.workspace.label,
        parameters.pipelineRun,
        {
            experimentName: parameters.targetExperiment.label,
            description: parameters.description,
            pipelineParameters: runParameters || {},
            dataPathAssignments: {},
            dataSetDefinitionValueAssignments: {}
        },
    );

    return {newRunId: data, newRunExperimentId: parameters.targetExperiment};
};

exports.stop = async ({connection, parameters, payload}) => {
    const client = await buildClient(connection);
    await client.regional.cancelMLPipelineRun(
        parameters.workspace.properties.discoveryUrl,
        parameters.resourceGroup.label,
        parameters.workspace.label,
        parameters.pipelineRun,
    )
};

const STATUS_MAPPING = {
    'Queued': JobStatus.QUEUED,
    'NotStarted': JobStatus.QUEUED,
    'CancelRequested': JobStatus.KILLING,
    'Canceled': JobStatus.KILLED,
    'Preparing': JobStatus.RUNNING,
    'Running': JobStatus.RUNNING,
    'Starting': JobStatus.RUNNING,
    'Finished': JobStatus.SUCCEEDED,
    'Completed': JobStatus.SUCCEEDED,
    'Failed': JobStatus.FAILED,
};

exports.getStatus = async ({connection, parameters, payload}) => {
    const client = await buildClient(connection);

    let pipelineRunId = payload.newRunId ?? parameters.pipelineRun;
    let experimentId = payload.newRunExperimentId ?? parameters.pipelineRun.experimentId;

    const {data} = await client.experiments.getRunDetails(
        parameters.workspace.properties.discoveryUrl,
        parameters.resourceGroup.label,
        parameters.workspace.label,
        experimentId,
        pipelineRunId,
    );

    return STATUS_MAPPING[data.status] || JobStatus.AWAITING;
};

exports.getLogs = async ({connection, parameters, payload}) => {
    const client = await buildClient(connection);

    let pipelineRunId = payload.newRunId ?? parameters.pipelineRun;
    let experimentId = payload.newRunExperimentId ?? parameters.pipelineRun.experimentId;

    const {data} = await client.experiments.getRunDetails(
        parameters.workspace.properties.discoveryUrl,
        parameters.resourceGroup.label,
        parameters.workspace.label,
        experimentId,
        pipelineRunId,
    );

    const {logFiles} = data;

    const logFilesUrls = Object.values(logFiles);

    if (logFilesUrls && logFilesUrls.length > 0) {
        let logsContent = '';

        await Promise.all(
            logFilesUrls.map(async (logFileUrl) => {
                const logFileContent = await client.get(logFileUrl);

                if (logFileContent && logFileContent.data) {
                    logsContent = logsContent.concat(logFileContent.data);
                }
            })
        );

        const logsLines = logsContent.split('\n');

        return logsLines.map((logLine) => Log(logLine));
    }

    return [];
};
