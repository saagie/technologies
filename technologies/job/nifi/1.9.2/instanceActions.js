const axios = require('axios');
const { Response, JobStatus, Log } = require('@saagie/sdk');

/**
 * Logic to start the external job instance.
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data.
 */
exports.start = async ({ job, instance }) => {
  try {

    await axios.put(
      `${job.featuresValues.endpoint.url}/nifi-api/flow/process-groups/${job.featuresValues.processgroups.id}`,
       ({
         "id": job.featuresValues.processgroups.id,
         "state":"RUNNING",
         "disconnectedNodeAcknowledged":false
      }),
    );
    return Response.success();
  } catch (error) {
    return Response.error(`Fail to job "${job.featuresValues.processgroups.name}"`, { error, "url": `${job.featuresValues.endpoint.url}/nifi-api/process-groups/${formParams.processgroups.id}` });
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
    await axios.put(
      `${job.featuresValues.endpoint.url}/nifi-api/flow/process-groups/${job.featuresValues.processgroups.id}`,
       ({
         "id": job.featuresValues.processgroups.id,
         "state":"STOPPED",
         "disconnectedNodeAcknowledged":false
      }),
    );

    return Response.success();
  } catch (error) {
    return Response.error(`Fail to job "${job.featuresValues.processgroups.name}"`, { error, url: `${job.featuresValues.endpoint.url}/nifi-api/process-groups/${formParams.processgroups.id}` });
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
    console.log('GET LOG INSTANCE:', instance);
    const { data } = await axios.get(
      `${job.featuresValues.endpoint.url}/nifi-api/flow/process-groups/${job.featuresValues.processgroups.id}/status`,
    );
    switch (data.processGroupStatus.aggregateSnapshot.processorStatusSnapshots[0].processorStatusSnapshot.runStatus) {
      case 'Running':
        return Response.success(JobStatus.RUNNING);
      case 'Stopped':
        return Response.success(JobStatus.KILLED);
      default:
        return Response.success(JobStatus.AWAITING);
    }
  } catch (error) {
    return Response.error(`Failed to get status for job ${job.featuresValues.processgroups.id}`, { error });
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
    const { data: logs } = await axios.get(
      `${job.featuresValues.endpoint.url}/nifi-api/flow/bulletin-board?groupId${job.featuresValues.processgroups.id}`,
    );
    const output = logs.bulletinBoard.bulletins
      .map(item => {
        const d=new Date();
        const isodate = (new Date(d.getUTCMonth()+ ' ' + d.getUTCDate() + ', ' + d.getUTCFullYear() + ' '+ item.bulletin.timestamp)).toISOString();
        if (item.bulletin.level=='ERROR') {
         return Log(item.bulletin.message,'stderr',isodate);
        } else {
          return Log(item.bulletin.message,'stdout',isodate);
        }
      });
    
    console.log(output);
    
    return Response.success(output);
  } catch (error) {
    console.log(error);
    return Response.error(`Fail to get logs of job " ${job.featuresValues.dataset.id}`, { error });
  }
};
