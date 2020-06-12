const axios = require('axios');
const { Response, JobStatus, Log, Stream } = require('@saagie/sdk');
const { google } = require('googleapis');
const ml = google.ml('v1');
const { getConnexion } = require('./utils');

/**
 * Logic to start the external job instance.
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data.
 */
exports.start = async ({ job, instance }) => {
  try {
    /* console.log('START INSTANCE:', instance);
    const { data } = await axios.post(
      `${job.featuresValues.endpoint.url}/api/demo/datasets/${job.featuresValues.dataset.id}/start`,
    );

    // You can return any payload you want to get in the stop and getStatus functions.
    return Response.success({ customId: data.id }); */
  } catch (error) {
    return Response.error('Fail to start job', { error, url: `${job.featuresValues.endpoint.url}/api/demo/datasets/${job.featuresValues.dataset.id}/start` });
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
    const gcpKey = JSON.parse(job.featuresValues.endpoint.jsonKey);
    
    const authClient = getConnexion(gcpKey);
    console.log('before stop')
    const res = await ml.projects.jobs.cancel({
      auth: authClient,
      name: "projects/" + gcpKey.project_id + "/jobs/" + job.featuresValues.jobs.id,
    });
    console.log(res)
    console.log('after stop')
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
    const gcpKey = JSON.parse(job.featuresValues.endpoint.jsonKey);
    
    const authClient = getConnexion(gcpKey);
    
    const { data } = await ml.projects.jobs.get({
      auth: authClient,
      name: "projects/" + gcpKey.project_id + "/jobs/" + job.featuresValues.jobs.id,
    });

    switch (data.state) {
      case 'FAILED':
        return Response.success(JobStatus.FAILED);
      case 'CANCELLED':
        return Response.success(JobStatus.KILLED);
      case 'QUEUED':
        return Response.success(JobStatus.QUEUED);
      case 'PREPARING':
        return Response.success(JobStatus.REQUESTED);
      case 'RUNNING':
        return Response.success(JobStatus.RUNNING);
      case 'SUCCEEDED':
        return Response.success(JobStatus.SUCCEEDED);
      case 'CANCELLING':
        return Response.success(JobStatus.KILLING);
      default:
        return Response.success(JobStatus.AWAITING);
    }
  } catch (error) {
    return Response.error(`Failed to get status for dataset ${job.featuresValues.jobs.id}`, { error });
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
    console.log('test get logs')
    const gcpKey = JSON.parse(job.featuresValues.endpoint.jsonKey);
    
    const authClient = getConnexion(gcpKey);
    
    const { data } = await ml.projects.jobs.get({
      auth: authClient,
      name: "projects/" + gcpKey.project_id + "/jobs/" + job.featuresValues.jobs.id,
      });
    
    //console.log(data)
    /* 
    if (!datasets || !datasets.length) {
      return Response.empty('No datasets availables');
    }
    */

    console.log(Log(data.errorMessage, Stream.STDERR, data.startTime))


    

    /* console.log('GET LOG INSTANCE:', instance);
    const { data } = await axios.get(
      `${job.featuresValues.endpoint.url}/api/demo/datasets/${job.featuresValues.dataset.id}/logs`,
    ); */
    return Response.success([Log(data.errorMessage, Stream.STDERR, data.startTime)])
    //return Response.success(data.logs.map((item) => Log(item.log, item.output, item.time)));
  } catch (error) {
    return Response.error(`Failed to get log for job ${job.featuresValues.jobs.id}`, { error });
  }
};
