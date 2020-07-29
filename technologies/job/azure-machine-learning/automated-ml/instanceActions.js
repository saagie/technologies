const axios = require('axios');
const { Response, JobStatus, Log } = require('@saagie/sdk');
const FormData = require('form-data');
const {
  getHeadersWithAccessTokenForManagementResource,
  getExperimentsApiServer,
  getRegionalApiServer,
  getErrorMessage,
} = require('../utils');
const { JOB_STATES } = require('../job-states');
const { ERRORS_MESSAGES } = require('../errors');

/**
 * Logic to start a new Automated ML run
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data.
 */
exports.start = async ({ job, instance }) => {
  try {
    console.log('START AUTOMATED ML RUN:', instance);

    const apiUrl = await getExperimentsApiServer(job.featuresValues.workspace);

    const { data } = await axios.get(
      `${apiUrl}/dataset/v1.0/subscriptions/${job.featuresValues.endpoint.subscriptionId}/resourceGroups/${job.featuresValues.resourceGroup.label}/providers/Microsoft.MachineLearningServices/workspaces/${job.featuresValues.workspace.label}/saveddatasets/${job.featuresValues.dataset.savedId}/tieredpreview`,
      await getHeadersWithAccessTokenForManagementResource(job.featuresValues.endpoint)
    );

    if (data && data.quickPreviewResult) {
      const datasetPreview = JSON.parse(data.quickPreviewResult);

      if (datasetPreview && datasetPreview.schema) {
        const dataPrep = {
          datasetId: job.featuresValues.dataset.id,
          features: datasetPreview.schema.map(column => column.id),
          label: "Column1",
        };

        const amlSettings = {
          'auto_blacklist': false,
          'enable_early_stopping': true,
          'enable_ensembling': true,
          'enable_stack_ensembling': true,
          'ensemble_iterations': 15,
          'enable_onnx_compatible_models': false,
          'max_cores_per_iteration': -1,
          'send_telemetry': true,
          'enable_distributed_featurization': true,
          'compute_target': job.featuresValues.compute.label,
          'enable_dnn': false,
          'experiment_exit_score': null,
          'experiment_timeout_minutes': 180,
          'featurization': 'auto',
          'is_timeseries': false,
          'iteration_timeout_minutes': 180,
          'max_concurrent_iterations': 6,
          'metric_operation': 'maximize',
          'model_explainability': true,
          'n_cross_validations': null,
          'name': job.featuresValues.experiment.label,
          'path': `./sample_projects/${job.featuresValues.experiment.label}`,
          'preprocess': true,
          'primary_metric': 'accuracy',
          'region': 'centralus',
          'resource_group': job.featuresValues.resourceGroup.label,
          'subscription_id': job.featuresValues.endpoint.subscriptionId,
          'task_type': 'classification',
          'validation_size': null,
          'vm_type': 'STANDARD_D1',
          'workspace_name': job.featuresValues.workspace.label,
        };

        const runProperties = {
          numIterations: 1000,
          metrics :["accuracy"],
          primaryMetric :"accuracy",
          trainSplit: 0,
          acquisitionParameter: 0,
          numCrossValidation: 5,
          target: job.featuresValues.compute.label,
          amlSettingsJsonString: JSON.stringify(amlSettings),
          dataPrepJsonString: JSON.stringify(dataPrep),
          enableSubsampling: false,
          scenario: "UI"
        };

        const headersWithAccessToken = await getHeadersWithAccessTokenForManagementResource(job.featuresValues.endpoint);

        const { data: runId } = await axios.post(
          `${apiUrl}/jasmine/v1.0/subscriptions/${job.featuresValues.endpoint.subscriptionId}/resourceGroups/${job.featuresValues.resourceGroup.label}/providers/Microsoft.MachineLearningServices/workspaces/${job.featuresValues.workspace.label}/experiment/${job.featuresValues.experiment.label}/run`,
          runProperties,
          headersWithAccessToken,
        );

        const jsonDefinition = `{"Configuration":{"script":"train.py","arguments":[],"target":"${job.featuresValues.compute.label}","framework":"python","communicator":"None","autoPrepareEnvironment":true,"maxRunDurationSeconds":null,"nodeCount":1,"environment":null,"history":{"outputCollection":true,"snapshotProject":true,"directoriesToWatch":["logs"]},"spark":{"configuration":{"spark.app.name":"Azure ML Experiment","spark.yarn.maxAppAttempts":1}},"hdi":{"yarnDeployMode":"cluster"},"tensorflow":{"workerCount":1,"parameterServerCount":1},"mpi":{"processCountPerNode":1},"dataReferences":{},"sourceDirectoryDataStore":null,"amlcompute":{"vmSize":null,"vmPriority":null,"retainCluster":false,"name":null,"clusterMaxNodeCount":1}}}`;

        const formData = new FormData();
        formData.append('json_definition', jsonDefinition);

        await axios.post(
          `${apiUrl}/jasmine/v1.0/subscriptions/${job.featuresValues.endpoint.subscriptionId}/resourceGroups/${job.featuresValues.resourceGroup.label}/providers/Microsoft.MachineLearningServices/workspaces/${job.featuresValues.workspace.label}/experiment/${job.featuresValues.experiment.label}/runs/${runId}/startSnapshotRun`,
          formData,
          {
            headers: {
              ...headersWithAccessToken.headers,
              ...formData.getHeaders(),
            }
          }
        );

        return Response.success({ runId });
      }
    }
    return Response.error(ERRORS_MESSAGES.FAILED_TO_RUN_AUTOMATED_ML_RUN_ERROR);
  } catch (error) {
    return getErrorMessage(error, ERRORS_MESSAGES.FAILED_TO_RUN_AUTOMATED_ML_RUN_ERROR);
  }
};

/**
 * Logic to stop the Automated ML run
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data including the payload returned in the start function.
 */
exports.stop = async ({ job, instance }) => {
  try {
    console.log('STOP AUTOMATED ML RUN:', instance);

    const apiUrl = await getRegionalApiServer(job.featuresValues.workspace);

    await axios.post(
      `${apiUrl}/jasmine/v1.0/subscriptions/${job.featuresValues.endpoint.subscriptionId}/resourceGroups/${job.featuresValues.resourceGroup.label}/providers/Microsoft.MachineLearningServices/workspaces/${job.featuresValues.workspace.label}/experiment/${job.featuresValues.experiment.label}/cancel/${instance.payload.runId}`,
      {},
      await getHeadersWithAccessTokenForManagementResource(job.featuresValues.endpoint)
    );

    return Response.success();
  } catch (error) {
    return getErrorMessage(error, ERRORS_MESSAGES.FAILED_TO_STOP_AUTOMATED_ML_RUN_ERROR);
  }
};

/**
 * Logic to retrieve the Automated ML run status.
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data including the payload returned in the start function.
 */
exports.getStatus = async ({ job, instance }) => {
  try {
    console.log('GET PIPELINE RUN STATUS:', instance);

    const apiUrl = await getExperimentsApiServer(job.featuresValues.workspace);

    const { data } = await axios.get(
      `${apiUrl}/history/v1.0/subscriptions/${job.featuresValues.endpoint.subscriptionId}/resourceGroups/${job.featuresValues.resourceGroup.label}/providers/Microsoft.MachineLearningServices/workspaces/${job.featuresValues.workspace.label}/experimentids/${job.featuresValues.experiment.id}/runs/${instance.payload.runId}/details`,
      await getHeadersWithAccessTokenForManagementResource(job.featuresValues.endpoint)
    );

    if (data && data.status) {
      return Response.success(JOB_STATES[data.status] || JobStatus.AWAITING);
    }

    return Response.success(JobStatus.AWAITING);
  } catch (error) {
    return getErrorMessage(error, ERRORS_MESSAGES.FAILED_TO_GET_AUTOMATED_ML_RUN_STATUS_ERROR);
  }
};

/**
 * Logic to retrieve the Automated ML run logs.
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data including the payload returned in the start function.
 */
exports.getLogs = async ({ job, instance }) => {
  try {
    console.log('GET PIPELINE RUN LOGS:', instance);

    const apiUrl = await getExperimentsApiServer(job.featuresValues.workspace);

    const { data } = await axios.get(
      `${apiUrl}/history/v1.0/subscriptions/${job.featuresValues.endpoint.subscriptionId}/resourceGroups/${job.featuresValues.resourceGroup.label}/providers/Microsoft.MachineLearningServices/workspaces/${job.featuresValues.workspace.label}/experimentids/${job.featuresValues.experiment.id}/runs/${instance.payload.runId}/details`,
      await getHeadersWithAccessTokenForManagementResource(job.featuresValues.endpoint)
    );

    const { logFiles } = data;

    const logFilesUrls = Object.values(logFiles);

    if (logFilesUrls && logFilesUrls.length > 0) {
      let logsContent = '';

      await Promise.all(
        logFilesUrls.map(async (logFileUrl) => {
          const logFileContent = await axios.get(logFileUrl);

          if (logFileContent && logFileContent.data) {
            logsContent = logsContent.concat(logFileContent.data);
          }
        })
      );

      const logsLines = logsContent.split('\n');

      return Response.success(logsLines.map((logLine) => Log(logLine)));
    }

    return Response.success([]);
  } catch (error) {
    return getErrorMessage(error, ERRORS_MESSAGES.FAILED_TO_GET_AUTOMATED_ML_RUN_LOGS_ERROR);
  }
};
