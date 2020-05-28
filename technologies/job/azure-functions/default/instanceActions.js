const axios = require('axios');
const { Response, JobStatus, Log, Stream } = require('@saagie/sdk');
const {
  getHeadersWithAccessTokenForManagementResource,
  getHeadersWithAccessTokenForInsightsResource
} = require('../utils');

/**
 * Logic to start the external job instance.
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data.
 */
exports.start = async ({ job, instance }) => {
  try {
    console.log('START INSTANCE:', instance);

    const functionKeysDataRes = await axios.post(
      `https://management.azure.com${job.featuresValues.function.id}/listkeys?api-version=2019-08-01`,
      {},
      await getHeadersWithAccessTokenForManagementResource(job.featuresValues.endpoint)
    );

    if (functionKeysDataRes && functionKeysDataRes.data && functionKeysDataRes.data.default) {
      const triggeredFunctionRes = await axios.get(
        `${job.featuresValues.function.triggerUrl}?code=${functionKeysDataRes.data.default}&name=Test`
      );

      console.log({ triggeredFunctionRes });
    }
  } catch (error) {
    return Response.error('Failed to start function', { error });
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
    await axios.post(
      `${job.featuresValues.endpoint.url}/api/demo/datasets/${job.featuresValues.dataset.id}/stop`,
    );

    return Response.success();
  } catch (error) {
    return Response.error('Fail to stop job', { error });
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
      `${job.featuresValues.endpoint.url}/api/demo/datasets/${job.featuresValues.dataset.id}`,
    );

    switch (data.status) {
      case 'IN_PROGRESS':
        return Response.success(JobStatus.RUNNING);
      case 'STOPPED':
        return Response.success(JobStatus.KILLED);
      default:
        return Response.success(JobStatus.AWAITING);
    }
  } catch (error) {
    return Response.error(`Failed to get status for dataset ${job.featuresValues.dataset.id}`, { error });
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

    if (
      requestsDataRes
      && requestsDataRes.data
      && requestsDataRes.data.value
      && requestsDataRes.data.value.length > 0
    ) {
      const allRequests = requestsDataRes.data.value;

      const requestsForFunction = allRequests.filter((req) => 
        req.request.name === job.featuresValues.function.functionName
        && req.request.url === job.featuresValues.function.triggerUrl
      );

      if (requestsForFunction && requestsForFunction.length > 0) {
        const logsDataRes = await axios.get(
          `https://api.applicationinsights.io/v1/apps/${job.featuresValues.endpoint.insightsAppId}/events/traces`,
          await getHeadersWithAccessTokenForInsightsResource(job.featuresValues.endpoint)
        );
    
        if (
          logsDataRes
          && logsDataRes.data
          && logsDataRes.data.value
          && logsDataRes.data.value.length > 0
        ) {
          const allLogs = logsDataRes.data.value;

          const functionLogs = allLogs.filter((log) => log.operation && log.operation.parentId === requestsForFunction[0].request.id);
    
          return Response.success(functionLogs.map(({ timestamp, trace, customDimensions }) => Log(`[${customDimensions && customDimensions.LogLevel}] ${trace.message}`, Stream.STDOUT, timestamp)));
        }
      }
    }

    return Response.success([]);
  } catch (error) {
    return Response.error(`Failed to get log for dataset ${job.featuresValues.dataset.id}`, { error });
  }
};
