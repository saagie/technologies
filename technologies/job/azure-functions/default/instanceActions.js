const axios = require('axios');
const { Response, JobStatus, Log, Stream } = require('@saagie/sdk');
const {
  getHeadersWithAccessTokenForManagementResource,
  getHeadersWithAccessTokenForInsightsResource,
  checkDataFromAzureResponse,
  getErrorMessage,
} = require('../utils');
const { ERRORS_MESSAGES } = require('../errors');

/**
 * Logic to start the external job instance.
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data.
 */
exports.start = async ({ job, instance }) => {
  try {
    console.log('START INSTANCE:', instance);

    await axios.put(
      `https://management.azure.com${job.featuresValues.function.id}/properties/state?api-version=2018-11-01`,
      { properties: 'enabled' },
      await getHeadersWithAccessTokenForManagementResource(job.featuresValues.endpoint),
    );

    return Response.success();
  } catch (error) {
    return getErrorMessage(error, ERRORS_MESSAGES.FAILED_TO_ENABLE_ERROR);
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

    await axios.put(
      `https://management.azure.com${job.featuresValues.function.id}/properties/state?api-version=2018-11-01`,
      { properties: 'disabled' },
      await getHeadersWithAccessTokenForManagementResource(job.featuresValues.endpoint),
    );

    return Response.success();
  } catch (error) {
    return getErrorMessage(error, ERRORS_MESSAGES.FAILED_TO_DISABLE_ERROR);
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
    const { data } = await axios.get(
      `https://management.azure.com${job.featuresValues.function.id}?api-version=2019-08-01`,
      await getHeadersWithAccessTokenForManagementResource(job.featuresValues.endpoint),
    );

    if (data && data.properties) {
      return Response.success(data.properties.isDisabled ? JobStatus.KILLED : JobStatus.RUNNING);
    }

    return Response.success(JobStatus.AWAITING);
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
    const requestsDataRes = await axios.get(
      `https://api.applicationinsights.io/v1/apps/${job.featuresValues.endpoint.insightsAppId}/events/requests`,
      await getHeadersWithAccessTokenForInsightsResource(job.featuresValues.endpoint)
    );

    if (checkDataFromAzureResponse(requestsDataRes)) {
      const allRequests = requestsDataRes.data.value;

      const requestsForFunction = allRequests.filter((req) => req.request.name === job.featuresValues.function.functionName);

      if (requestsForFunction && requestsForFunction.length > 0) {
        const logsDataRes = await axios.get(
          `https://api.applicationinsights.io/v1/apps/${job.featuresValues.endpoint.insightsAppId}/events/traces`,
          await getHeadersWithAccessTokenForInsightsResource(job.featuresValues.endpoint)
        );
    
        if (checkDataFromAzureResponse(logsDataRes)) {
          const allLogs = logsDataRes.data.value;

          const functionLogs = allLogs.filter((log) => (
            requestsForFunction.some((req) => req.request.id === (log.operation && log.operation.parentId))
          ));
    
          return Response.success(functionLogs.map(({ timestamp, trace, customDimensions }) => Log(`[${customDimensions && customDimensions.LogLevel}] ${trace.message}`, Stream.STDOUT, timestamp)));
        }
      }
    }

    return Response.success([]);
  } catch (error) {
    return getErrorMessage(error, ERRORS_MESSAGES.FAILED_TO_GET_LOGS_ERROR);
  }
};
