const axios = require('axios');
const { Response, JobStatus } = require('@saagie/sdk');

exports.start = async ({ name, formParams }) => {
  try {

    await axios.put(
      `${formParams.endpoint.url}/nifi-api/flow/process-groups/${formParams.processgroups.id}`,
       ({
         "id": formParams.processgroups.id,
         "state":"RUNNING",
         "disconnectedNodeAcknowledged":false
      }),
    );
    return Response.success();
  } catch (error) {
    return Response.error(`Fail to job "${name}"`, { error, "url": `${formParams.endpoint.url}/nifi-api/process-groups/${formParams.processgroups.id}` });
  }
};

exports.stop = async ({ name, formParams }) => {
  try {
    await axios.put(
      `${formParams.endpoint.url}/nifi-api/flow/process-groups/${formParams.processgroups.id}`,
       ({
         "id": formParams.processgroups.id,
         "state":"STOPPED",
         "disconnectedNodeAcknowledged":false
      }),
    );

    return Response.success();
  } catch (error) {
    return Response.error(`Fail to job "${name}"`, { error, url: `${formParams.endpoint.url}/nifi-api/process-groups/${formParams.processgroups.id}` });
  }
};

exports.getStatus = async ({ formParams }) => {
  try {
    const { data } = await axios.get(
      `${formParams.endpoint.url}/nifi-api/flow/process-groups/${formParams.processgroups.id}/status`,
    );
    switch (data.processGroupStatus.aggregateSnapshot.processorStatusSnapshots[0].processorStatusSnapshot.runStatus) {
      case 'Running':
        return Response.success(JobStatus.RUNNING);
      case 'Stopped':
        return Response.success(JobStatus.STOPPED);
      default:
        return Response.success(JobStatus.AWAITING);
    }
  } catch (error) {
    return Response.error(`Failed to get status for job ${formParams.processgroups.id}`, { error });
  }

};

exports.getLogs = async ({ formParams }) => {

  try {
    const { data: logs } = await axios.get(
      `${formParams.endpoint.url}/nifi-api/flow/bulletin-board?after=299213`,
    );

    return Response.success(logs.bulletinBoard.bulletins);

  } catch (error) {
    return Response.error(`Fail to get logs of job " ${formParams.dataset.id}`, { error });
  }
};