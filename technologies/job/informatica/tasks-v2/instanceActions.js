const axios = require('axios');
const { Response, JobStatus, Log } = require('@saagie/sdk');
const { ERRORS_MESSAGES } = require('../errors');
const { JOB_EXECUTION_STATES, JOB_STATES } = require('../job-states');
const { loginUser, getV2RequestHeadersFromEndpointForm, getErrorMessage } = require('./utils');

/**
 * Logic to start the external job instance.
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data.
 */
exports.start = async ({ job, instance }) => {
  try {
    console.log('START INSTANCE:', instance);
    const userData = await loginUser(job.featuresValues);

    if (userData && userData.icSessionId && userData.serverUrl) {
      const result = await axios.post(
        `${userData.serverUrl}/api/v2/job`,
        {
          '@type': 'job',
          taskId: job.featuresValues.task.id,
          taskType: job.featuresValues.taskType.id
        },
        getV2RequestHeadersFromEndpointForm(userData)
      );

      if (!result || !result.data) {
        return Response.error(ERRORS_MESSAGES.NO_RESPONSE_FROM_INFORMATICA, { error: new Error(ERRORS_MESSAGES.NO_RESPONSE_FROM_INFORMATICA) });
      }

      const { data } = result;

      return Response.success(data);
    }

    return Response.error(ERRORS_MESSAGES.LOGIN_ERROR, { error: new Error(ERRORS_MESSAGES.LOGIN_ERROR) });
  } catch (error) {
    return getErrorMessage(error, ERRORS_MESSAGES.FAILED_TO_RUN_JOB_ERROR);
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
    const userData = await loginUser(job.featuresValues);

    if (userData && userData.icSessionId && userData.serverUrl) {
      const result = await axios.post(
        `${userData.serverUrl}/api/v2/job/stop`,
        {
          '@type': 'job',
          taskId: job.featuresValues.task.id,
          taskType: job.featuresValues.taskType.id
        },
        getV2RequestHeadersFromEndpointForm(userData)
      );

      if (!result || !result.data) {
        return Response.error(ERRORS_MESSAGES.NO_RESPONSE_FROM_INFORMATICA, { error: new Error(ERRORS_MESSAGES.NO_RESPONSE_FROM_INFORMATICA) });
      }

      return Response.success();
    }

    return Response.error(ERRORS_MESSAGES.LOGIN_ERROR, { error: new Error(ERRORS_MESSAGES.LOGIN_ERROR) });
  } catch (error) {
    return getErrorMessage(error, ERRORS_MESSAGES.FAILED_TO_STOP_JOB_ERROR);
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
    const userData = await loginUser(job.featuresValues);

    if (userData && userData.icSessionId && userData.serverUrl) {
      const resultActivityMonitor = await axios.get(
        `${userData.serverUrl}/api/v2/activity/activityMonitor?details=true`,
        getV2RequestHeadersFromEndpointForm(userData)
      );

      if (!resultActivityMonitor || !resultActivityMonitor.data) {
        return Response.error(ERRORS_MESSAGES.NO_RESPONSE_FROM_INFORMATICA, { error: new Error(ERRORS_MESSAGES.NO_RESPONSE_FROM_INFORMATICA) });
      }

      const { data: activityMonitors } = resultActivityMonitor;

      const activityMonitorForJob = activityMonitors.find((activityMonitor) => activityMonitor.runId === instance.payload.runId);

      if (activityMonitorForJob) {
        return Response.success(JOB_EXECUTION_STATES[activityMonitorForJob.executionState] || JobStatus.AWAITING);
      }

      const resultActivityLog = await axios.get(
        `${userData.serverUrl}/api/v2/activity/activityLog?runId=${instance.payload.runId}`,
        getV2RequestHeadersFromEndpointForm(userData)
      );

      if (!resultActivityLog || !resultActivityLog.data || !resultActivityLog.data.length) {
        return Response.error(ERRORS_MESSAGES.NO_RESPONSE_FROM_INFORMATICA, { error: new Error(ERRORS_MESSAGES.NO_RESPONSE_FROM_INFORMATICA) });
      }

      const { data: activityLogs } = resultActivityLog;

      const activityLogForJob = activityLogs.find((activityLog) => activityLog.objectId === job.featuresValues.task.id);

      if (activityLogForJob) {
        return Response.success(JOB_STATES[activityLogForJob.state] || JobStatus.AWAITING);
      } else {
        return Response.error(ERRORS_MESSAGES.FAILED_TO_GET_LOGS_ERROR, { error: new Error(ERRORS_MESSAGES.FAILED_TO_GET_STATUS_ERROR) });
      }
    }

    return Response.error(ERRORS_MESSAGES.LOGIN_ERROR, { error: new Error(ERRORS_MESSAGES.LOGIN_ERROR) });
  } catch (error) {
    return getErrorMessage(error, ERRORS_MESSAGES.FAILED_TO_GET_STATUS_ERROR);
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
    const userData = await loginUser(job.featuresValues);

    if (userData && userData.icSessionId && userData.serverUrl) {
      const resultActivityLog = await axios.get(
        `${userData.serverUrl}/api/v2/activity/activityLog?runId=${instance.payload.runId}`,
        getV2RequestHeadersFromEndpointForm(userData)
      );

      if (!resultActivityLog || !resultActivityLog.data) {
        return Response.error(ERRORS_MESSAGES.NO_RESPONSE_FROM_INFORMATICA, { error: new Error(ERRORS_MESSAGES.NO_RESPONSE_FROM_INFORMATICA) });
      }

      const { data: activityLogs } = resultActivityLog;

      if (!activityLogs.length) {
        return Response.success();
      }

      const activityLogForJob = activityLogs.find((activityLog) => activityLog.objectId === job.featuresValues.task.id);

      if (activityLogForJob) {
        const resultSessionLog = await axios.get(
          `${userData.serverUrl}/api/v2/activity/activityLog/${activityLogForJob.id}/sessionLog`,
          getV2RequestHeadersFromEndpointForm(userData)
        );
  
        if (!resultSessionLog || !resultSessionLog.data) {
          return Response.error(ERRORS_MESSAGES.NO_RESPONSE_FROM_INFORMATICA, { error: new Error(ERRORS_MESSAGES.NO_RESPONSE_FROM_INFORMATICA) });
        }
  
        const { data: sessionLog } = resultSessionLog;
  
        const sessionLogLines = sessionLog.split('\n');
  
        return Response.success(sessionLogLines.map((line) => Log(line, null, null)));
      }

      return Response.error(ERRORS_MESSAGES.FAILED_TO_GET_LOGS_ERROR, { error: new Error(ERRORS_MESSAGES.FAILED_TO_GET_LOGS_ERROR) });
    }

    return Response.error(ERRORS_MESSAGES.LOGIN_ERROR, { error: new Error(ERRORS_MESSAGES.LOGIN_ERROR) });
  } catch (error) {
    return getErrorMessage(error, ERRORS_MESSAGES.FAILED_TO_GET_LOGS_ERROR);
  }
};
