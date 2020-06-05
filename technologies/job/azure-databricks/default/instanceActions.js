const axios = require('axios');
const { Response, JobStatus, Log } = require('@saagie/sdk');
const {
  getHeadersWithAccessTokenForDatabricksResource,
  getAccessTokenForManagementCoreResource,
  getErrorMessage,
} = require('../utils');
const { ERRORS_MESSAGES } = require('../errors');
const { JOB_STATES } = require('../job-states');

/**
 * Logic to start the external job instance.
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data.
 */
exports.start = async ({ job, instance }) => {
  try {
    console.log('START INSTANCE:', instance);

    const res = await axios.post(
      `https://${job.featuresValues.workspace.url}/api/2.0/jobs/run-now`,
      {
        job_id: job.featuresValues.job.id,
      },
      {
        headers: {
          ...await getHeadersWithAccessTokenForDatabricksResource(job.featuresValues.endpoint),
          'X-Databricks-Azure-Workspace-Resource-Id': job.featuresValues.workspace.id,
          'X-Databricks-Azure-SP-Management-Token': await getAccessTokenForManagementCoreResource(job.featuresValues.endpoint)
        }
      }
    );

    if (res && res.data && res.data.run_id) {
      return Response.success({
        run_id: res.data.run_id,
      });
    }

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

    await axios.post(
      `https://${job.featuresValues.workspace.url}/api/2.0/jobs/runs/cancel`,
      {
        run_id: instance.payload.run_id,
      },
      {
        headers: {
          ...await getHeadersWithAccessTokenForDatabricksResource(job.featuresValues.endpoint),
          'X-Databricks-Azure-Workspace-Resource-Id': job.featuresValues.workspace.id,
          'X-Databricks-Azure-SP-Management-Token': await getAccessTokenForManagementCoreResource(job.featuresValues.endpoint)
        }
      }
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
    const res = await axios.get(
      `https://${job.featuresValues.workspace.url}/api/2.0/jobs/runs/get?run_id=${instance.payload.run_id}`,
      {
        headers: {
          ...await getHeadersWithAccessTokenForDatabricksResource(job.featuresValues.endpoint),
          'X-Databricks-Azure-Workspace-Resource-Id': job.featuresValues.workspace.id,
          'X-Databricks-Azure-SP-Management-Token': await getAccessTokenForManagementCoreResource(job.featuresValues.endpoint)
        }
      }
    );

    if (res && res.data && res.data.state) {
      return Response.success(
        JOB_STATES[res.data.state.life_cycle_state]
        || JOB_STATES[res.data.state.result_state]
        || JobStatus.AWAITING
      );
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
    const res = await axios.get(
      `https://${job.featuresValues.workspace.url}/api/2.0/jobs/runs/get-output?run_id=8`,
      {
        headers: {
          ...await getHeadersWithAccessTokenForDatabricksResource(job.featuresValues.endpoint),
          'X-Databricks-Azure-Workspace-Resource-Id': job.featuresValues.workspace.id,
          'X-Databricks-Azure-SP-Management-Token': await getAccessTokenForManagementCoreResource(job.featuresValues.endpoint)
        }
      }
    );

    console.log(res.data);

    if (res && res.data && res.data.error) {
      return Response.success([Log(res.data.error)]);
    }

    if (res && res.data && res.data.notebook_output && res.data.notebook_output.result) {
      return Response.success([Log(res.data.notebook_output.result)]);
    }

    return Response.success([]);
  } catch (error) {
    console.log({ error });
    return getErrorMessage(error, ERRORS_MESSAGES.FAILED_TO_GET_LOGS_ERROR);
  }
};
