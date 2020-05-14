const { Response, JobStatus, Log, Stream } = require('@saagie/sdk');

const { JOB_STATES } = require('../job-states');
const {
  getDataIntegrationClientAuthenticated,
  getResponseBodyFromSOAPRequest,
} = require('./utils');
const { ERRORS_MESSAGES } = require('../errors');

const DEFAULT_TIMEOUT = 5000;

/**
 * Logic to start the external job instance.
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data.
 */
exports.start = async ({ job, instance }) => {
  try {
    console.log('START INSTANCE:', instance);
    const client = await getDataIntegrationClientAuthenticated(job.featuresValues);

    const workflowInformations = {
      DIServiceInfo: {
        ServiceName: job.featuresValues.service.label,
      },
      FolderName: job.featuresValues.folder.label,
      WorkflowName: job.featuresValues.workflow.label,
      RequestMode: job.featuresValues.requestMode.id,
    };

    if (job.featuresValues && job.featuresValues.task && job.featuresValues.task.label) {
      await client.startTaskAsync({
        ...workflowInformations,
        TaskInstancePath: job.featuresValues.task.label,
      });
    } else {
      await client.startWorkflowAsync(workflowInformations);
    }

    return Response.success();
  } catch (error) {
    return Response.error(ERRORS_MESSAGES.FAILED_TO_RUN_JOB_ERROR, { error });
  }
};

/**
 * Logic to stop the external job instance.
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data including the payload returned in the start function.
 */
exports.stop = async ({ job, instance }) => {
  try {
    console.log('STOP INSTANCE:', instance);
    const client = await getDataIntegrationClientAuthenticated(job.featuresValues);

    const workflowInformations = {
      DIServiceInfo: {
        ServiceName: job.featuresValues.service.label,
      },
      FolderName: job.featuresValues.folder.label,
      WorkflowName: job.featuresValues.workflow.label,
      RequestMode: job.featuresValues.requestMode.id,
    };

    if (job.featuresValues && job.featuresValues.task && job.featuresValues.task.label) {
      await client.stopTaskAsync({
        ...workflowInformations,
        TaskInstancePath: job.featuresValues.task.label,
      });
    } else {
      await client.stopWorkflowAsync(workflowInformations);
    }

    return Response.success();
  } catch (error) {
    return Response.error(ERRORS_MESSAGES.FAILED_TO_STOP_JOB_ERROR, { error });
  }
};

/**
 * Logic to retrieve the external job instance status.
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data including the payload returned in the start function.
 */
exports.getStatus = async ({ job, instance }) => {
  try {
    console.log('GET STATUS INSTANCE:', instance);
    const client = await getDataIntegrationClientAuthenticated(job.featuresValues);

    const workflowInformations = {
      DIServiceInfo: {
        ServiceName: job.featuresValues.service.label,
      },
      FolderName: job.featuresValues.folder.label,
      WorkflowName: job.featuresValues.workflow.label,
    };

    let res = null;

    if (job.featuresValues && job.featuresValues.task && job.featuresValues.task.label) {
      res = await client.getTaskDetailsAsync({
        ...workflowInformations,
        TaskInstancePath: job.featuresValues.task.label,
      });
    } else {
      res = await client.getWorkflowDetailsAsync(workflowInformations);
    }

    const resBody = getResponseBodyFromSOAPRequest(res);

    if (resBody && resBody.length > 0 && resBody[0]) {
      return Response.success(
        JOB_STATES[resBody[0].TaskRunStatus || resBody[0].WorkflowRunStatus]
        || JobStatus.AWAITING
      );
    }

    return Response.empty();
  } catch (error) {
    return Response.error(ERRORS_MESSAGES.FAILED_TO_GET_STATUS_ERROR, { error });
  }
};

/**
 * Logic to retrieve the external job instance logs.
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data including the payload returned in the start function.
 */
exports.getLogs = async ({ job, instance }) => {
  try {
    console.log('GET LOG INSTANCE:', instance);
    const client = await getDataIntegrationClientAuthenticated(job.featuresValues);

    const workflowInformations = {
      DIServiceInfo: {
        ServiceName: job.featuresValues.service.label,
      },
      FolderName: job.featuresValues.folder.label,
      WorkflowName: job.featuresValues.workflow.label,
    };

    let res = null;

    if (job.featuresValues && job.featuresValues.task && job.featuresValues.task.label) {
      res = await client.getSessionLogAsync({
        ...workflowInformations,
        TaskInstancePath: job.featuresValues.task.label,
        Timeout: DEFAULT_TIMEOUT,
      });
    } else {
      res = await client.getWorkflowLogAsync({
        ...workflowInformations,
        Timeout: DEFAULT_TIMEOUT,
      });
    }

    const resBody = getResponseBodyFromSOAPRequest(res);

    if (resBody && resBody.length > 0 && resBody[0]) {
      const logs = resBody[0].Buffer;
      const logsLines = logs.split('\n');

      return Response.success(logsLines.map((logLine) => Log(logLine, Stream.STDOUT, null)));
    }

    return Response.empty();
  } catch (error) {
    return Response.error(ERRORS_MESSAGES.FAILED_TO_GET_LOGS_ERROR, { error });
  }
};
