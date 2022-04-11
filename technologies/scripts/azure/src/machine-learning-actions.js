import {buildClient} from './client';
import {JobStatus} from './JobStatus';

const TASK_TYPES = {
    CLASSIFICATION: 'classification',
    REGRESSION: 'regression',
    TIME_SERIES: 'time-series-forecasting',
};

const METRICS = {
    'classification': 'accuracy',
    'regression': 'spearman_correlation',
    'time-series-forecasting': 'normalized_root_mean_squared_error',
};

exports.startAutomatedML = async ({connection, parameters}) => {
    const client = await buildClient(connection);
    const {data} = client.experiments.getDatasetColumns(parameters.workspace.properties.discoveryUrl, parameters.resourceGroup.label, parameters.workspace.label, parameters.dataset.savedId);

    const datasetPreview = JSON.parse(data.quickPreviewResult);

    const dataPrep = {
        datasetId: parameters.dataset,
        features: datasetPreview.schema.map(column => column.id),
        label: parameters.targetColumn,
    };

    const amlSettings = {
        auto_blacklist: false,
        enable_early_stopping: true,
        enable_ensembling: true,
        enable_stack_ensembling: true,
        ensemble_iterations: 15,
        enable_onnx_compatible_models: false,
        max_cores_per_iteration: -1,
        send_telemetry: true,
        enable_distributed_featurization: true,
        compute_target: parameters.compute.label,
        enable_dnn: false,
        experiment_exit_score: null,
        experiment_timeout_minutes: 180,
        featurization: 'auto',
        is_timeseries: parameters.taskType === TASK_TYPES.TIME_SERIES,
        iteration_timeout_minutes: 180,
        max_concurrent_iterations: 6,
        metric_operation: parameters.taskType === TASK_TYPES.TIME_SERIES ? 'minimize' : 'maximize',
        model_explainability: true,
        n_cross_validations: parameters.taskType === TASK_TYPES.TIME_SERIES ? 5 : null,
        name: parameters.experiment.label,
        path: `./sample_projects/${parameters.experiment.label}`,
        preprocess: true,
        primary_metric: METRICS[parameters.taskType],
        region: 'centralus',
        resource_group: parameters.resourceGroup.label,
        subscription_id: connection.subscriptionId,
        task_type: parameters.taskType === TASK_TYPES.CLASSIFICATION ? parameters.taskType : TASK_TYPES.REGRESSION,
        validation_size: null,
        vm_type: parameters.compute.properties.properties.vmSize,
        workspace_name: parameters.workspace.label,
    };

    if (parameters.taskType === TASK_TYPES.TIME_SERIES) {
        amlSettings['max_horizon'] = 'auto';
        amlSettings['target_lags'] = null;
        amlSettings['target_rolling_window_size'] = null;
        amlSettings['time_column_name'] = parameters.timeColumn;
    }

    let amlSettingsJsonString = JSON.stringify(amlSettings);

    let dataPrepJsonString = JSON.stringify(dataPrep).replace(/"/g, '\\"');

    const runProperties = {
        numIterations: 1000,
        metrics: [METRICS[parameters.taskType]],
        primaryMetric: METRICS[parameters.taskType],
        trainSplit: 0,
        acquisitionParameter: 0,
        numCrossValidation: 5,
        target: parameters.compute.label,
        amlSettingsJsonString,
        dataPrepJsonString,
        enableSubsampling: false,
        scenario: "UI"
    };

    const {data: runId} = await client.experiments.runExperiment(
        parameters.workspace.properties.discoveryUrl,
        parameters.resourceGroup.label,
        parameters.workspace.label,
        parameters.experiment.label,
        runProperties
    );

    const jsonDefinition = {
        Configuration: {
            script: '../dist/module.js',
            arguments: [],
            target: parameters.compute.label,
            framework: "python",
            communicator: "None",
            autoPrepareEnvironment: true,
            maxRunDurationSeconds: null,
            nodeCount: 1,
            environment: null,
            history: {
                outputCollection: true,
                snapshotProject: true,
                directoriesToWatch: ["logs"]
            },
            spark: {
                configuration: {
                    'spark.app.name': "Azure ML Experiment",
                    'spark.yarn.maxAppAttempts': 1
                }
            },
            hdi: {
                yarnDeployMode: "cluster"
            },
            tensorflow: {
                workerCount: 1,
                parameterServerCount: 1
            },
            mpi: {
                processCountPerNode: 1
            },
            dataReferences: {},
            sourceDirectoryDataStore: null,
            amlcompute: {
                vmSize: null,
                vmPriority: null,
                retainCluster: false,
                name: null,
                clusterMaxNodeCount: 1
            }
        }
    };

    await client.experiments.startSnapshotRun(
        parameters.workspace.properties.discoveryUrl,
        parameters.resourceGroup.label,
        parameters.workspace.label,
        parameters.experiment.label,
        runId,
        jsonDefinition
    );

    return {runId};
};

exports.startExperiment = async ({connection, parameters}) => {
    const client = await buildClient(connection);
    const projectZipFileObj = Buffer.from(parameters.projectZipFile, "base64");
    const runDefinitionFileObj = Buffer.from(parameters.runDefinitionFile, "base64");
    const {data} = await client.regional.startRun(
        parameters.workspace.properties.discoveryUrl,
        parameters.resourceGroup.label,
        parameters.workspace.label,
        parameters.experiment.label,
        projectZipFileObj,
        runDefinitionFileObj,
    );
    return {runId: data.runId};
};

exports.stopAutomatedML = async ({connection, parameters, payload}) => {
    const client = await buildClient(connection);
    await client.regional.cancelRun(
        parameters.workspace.properties.discoveryUrl,
        parameters.resourceGroup.label,
        parameters.workspace.label,
        parameters.experiment.label,
        payload.runId
    );
};

exports.stopExperiment = async ({connection, parameters, payload}) => {
    const client = await buildClient(connection);
    await client.regional.cancelExecutionRun(
        parameters.workspace.properties.discoveryUrl,
        parameters.resourceGroup.label,
        parameters.workspace.label,
        parameters.experiment.label,
        payload.runId
    );
};

export const STATUS_MAPPING = {
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

exports.getStatus = async ({connection, parameters}) => {
    const client = await buildClient(connection);
    const {data} = await client.experiments.getRunDetails(
        parameters.workspace.properties.discoveryUrl,
        parameters.resourceGroup.label,
        parameters.workspace.label,
        parameters.experiment.label,
        payload.runId
    );
    return STATUS_MAPPING[data?.status] || JobStatus.AWAITING;
};

exports.getLogs = async ({connection, parameters}) => {
    const client = await buildClient(connection);
    const {data} = await client.experiments.getRunDetails(
        parameters.workspace.properties.discoveryUrl,
        parameters.resourceGroup.label,
        parameters.workspace.label,
        parameters.experiment.label,
        payload.runId
    );
    const {logFiles} = data;

    let logFilesUrls = Object.values(logFiles);
    let setupLogFilesUrls = [];

    if (data && data.status !== 'NotStarted') {
        const {data: setupData} = await client.experiments.getRunSetupDetails(
            parameters.workspace.properties.discoveryUrl,
            parameters.resourceGroup.label,
            parameters.workspace.label,
            parameters.experiment.label,
            payload.runId
        );
        const {logFiles: setupLogFiles} = setupData;
        setupLogFilesUrls = Object.values(setupLogFiles);
    }

    logFilesUrls = logFilesUrls.concat(setupLogFilesUrls);

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
};
