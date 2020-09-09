const axios = require('axios');
const { Response, JobStatus, Log } = require('@saagie/sdk');
const {
  getHeadersWithAccessTokenForDatabricksResource,
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

    const jobToRun = {
      job_id: job.featuresValues.job.id
    };

    if (job.featuresValues.jobParameters) {
      jobToRun.spark_submit_params = JSON.parse(job.featuresValues.jobParameters);
    }

    const res = await axios.post(
      `https://${job.featuresValues.workspace.url}/api/2.0/jobs/run-now`,
      jobToRun,
      await getHeadersWithAccessTokenForDatabricksResource(job.featuresValues),
    );

    if (res && res.data && res.data.run_id) {
      return Response.success({
        run_id: res.data.run_id,
      });
    }

    return Response.success();
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

    await axios.post(
      `https://${job.featuresValues.workspace.url}/api/2.0/jobs/runs/cancel`,
      {
        run_id: instance.payload.run_id,
      },
      await getHeadersWithAccessTokenForDatabricksResource(job.featuresValues),
    );

    return Response.success();
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
    const res = await axios.get(
      `https://${job.featuresValues.workspace.url}/api/2.0/jobs/runs/get?run_id=${instance.payload.run_id}`,
      await getHeadersWithAccessTokenForDatabricksResource(job.featuresValues),
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
      `https://${job.featuresValues.workspace.url}/api/2.0/jobs/runs/get?run_id=${instance.payload.run_id}`,
      await getHeadersWithAccessTokenForDatabricksResource(job.featuresValues),
    );

    if (res && res.data && res.data.cluster_instance && res.data.cluster_instance.cluster_id) {
      const clusterId = res.data.cluster_instance.cluster_id;

      const resCluster = await axios.get(
        `https://${job.featuresValues.workspace.url}/api/2.0/clusters/get?cluster_id=${clusterId}`,
        await getHeadersWithAccessTokenForDatabricksResource(job.featuresValues),
      );

      const { data : clusterData } = resCluster;

      if (
        clusterData
        && clusterData.cluster_log_conf
        && clusterData.cluster_log_conf.dbfs
        && clusterData.cluster_log_conf.dbfs.destination
      ) {
        const logsDestination = clusterData.cluster_log_conf.dbfs.destination;

        const resLogs = await axios.get(
          `https://${job.featuresValues.workspace.url}/api/2.0/dbfs/read?path=${logsDestination}/${clusterId}/driver/stdout`,
          await getHeadersWithAccessTokenForDatabricksResource(job.featuresValues),
        );

        const { data: dataLogs } = resLogs;

        const logsBuffer = new Buffer.from(dataLogs.data, 'base64');
        const logsContent = logsBuffer.toString('utf8');

        const logsLines = logsContent.split('\n');

        return Response.success(logsLines.map((logLine) => Log(logLine)));
      }
    }

    return Response.success([]);
  } catch (error) {
    return getErrorMessage(error, ERRORS_MESSAGES.FAILED_TO_GET_LOGS_ERROR);
  }
};
