const axios = require('axios');
const { Response, JobStatus} = require('@saagie/sdk');
const { JOB_STATES } = require('../job-states');
const { getRequestConfigFromEndpointForm } = require('./utils');
const { ERRORS_MESSAGES, VALIDATION_FIELD } = require('../errors');

/**
 * Logic to start the external job instance.
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data.
 */
exports.start = async ({ job, instance }) => {
  try {
    console.log('START INSTANCE:', instance);

    const { data } = await axios.post(
      `${job.featuresValues.endpoint.url}/v4/jobGroups`,
      {
        wrangledDataset: {
          id: parseInt(job.featuresValues.datasetID),
        }
      },
      getRequestConfigFromEndpointForm(job.featuresValues.endpoint)
    );
    // You can return any payload you want to get in the stop and getStatus functions.
    return Response.success({ jobGroupId: data.id });
  } catch (error) {
    if (error && error.response) {
      if (
        error.response.status === 400
        && error.response.data
        && error.response.data.exception
        && error.response.data.exception.name === VALIDATION_FIELD
      ) {
        return Response.error(ERRORS_MESSAGES.MISSING_RUN_ENV_ERROR, { error: new Error(`${ERRORS_MESSAGES.MISSING_RUN_ENV_FULL_ERROR} : ${error.response.data.exception.name} - ${error.response.data.exception.message} : ${error.response.data.exception.details}`) });
      }

      if (error.response.data && error.response.data.exception) {
        return Response.error(`${ERRORS_MESSAGES.FAILED_TO_RUN_JOB_ERROR} : ${error.response.data.exception.name} - ${error.response.data.exception.message} : ${error.response.data.exception.details}`, { error: new Error(`${error.response.data.exception.name} - ${error.response.data.exception.message} : ${error.response.data.exception.details}`) });
      }

      return Response.error(`${ERRORS_MESSAGES.FAILED_TO_RUN_JOB_ERROR} : ${error.response.status} - ${error.response.statusText}`, { error: new Error(`${error.response.status} - ${error.response.statusText}`) });
    }

    return Response.error(ERRORS_MESSAGES.FAILED_TO_RUN_JOB_ERROR, { error });
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
      `${job.featuresValues.endpoint.url}/v4/jobGroups/${instance.payload.jobGroupId}`,
      getRequestConfigFromEndpointForm(job.featuresValues.endpoint)
    );

    return Response.success(JOB_STATES[data.status] || JobStatus.AWAITING);

  } catch (error) {
    if (error && error.response) {
      return Response.error(`${ERRORS_MESSAGES.FAILED_TO_GET_STATUS_ERROR} : ${error.response.status} - ${error.response.statusText}`, { error: new Error(`${error.response.status} - ${error.response.statusText}`) });
    }

    return Response.error(`${ERRORS_MESSAGES.FAILED_TO_GET_STATUS_ERROR} : ${job.featuresValues.datasetID}`, { error });
  }
};
