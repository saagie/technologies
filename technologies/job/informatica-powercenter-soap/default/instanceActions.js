const axios = require('axios');
const { Response, JobStatus, Log, Stream } = require('@saagie/sdk');
const soap = require('soap');
const parser = require('fast-xml-parser');

const { JOB_STATES } = require('../job-states');
const { getSessionId, getDataIntegrationWSDLUrl } = require('./utils');

/**
 * Logic to start the external job instance.
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data.
 */
exports.start = async ({ job, instance }) => {
  try {
    console.log('START INSTANCE:', instance);
    const url = getDataIntegrationWSDLUrl(job.featuresValues);

    const client = await soap.createClientAsync(url);

    const sessionId = await getSessionId(job.featuresValues);

    client.addSoapHeader({
      'ns0:Context': {
        attributes: { 'xmlns:ns0': 'http://www.informatica.com/wsh' },
        SessionId: sessionId
      }
    });

    await client.startWorkflowAsync({
      DIServiceInfo: {
        ServiceName: job.featuresValues.service.label,
      },
      FolderName: job.featuresValues.folder.label,
      WorkflowName: job.featuresValues.workflow.label,
      RequestMode: job.featuresValues.requestMode.id,
    });

    return Response.success();
  } catch (error) {
    return Response.error('Fail to start job', { error });
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
    const url = getDataIntegrationWSDLUrl(job.featuresValues);

    const client = await soap.createClientAsync(url);

    const sessionId = await getSessionId(job.featuresValues);

    client.addSoapHeader({
      'ns0:Context': {
        attributes: { 'xmlns:ns0': 'http://www.informatica.com/wsh' },
        SessionId: sessionId
      }
    });

    await client.stopWorkflowAsync({
      DIServiceInfo: {
        ServiceName: job.featuresValues.service.label,
      },
      FolderName: job.featuresValues.folder.label,
      WorkflowName: job.featuresValues.workflow.label,
      RequestMode: job.featuresValues.requestMode.id,
    });

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
    const url = getDataIntegrationWSDLUrl(job.featuresValues);

    const client = await soap.createClientAsync(url);

    const sessionId = await getSessionId(job.featuresValues);

    client.addSoapHeader({
      'ns0:Context': {
        attributes: { 'xmlns:ns0': 'http://www.informatica.com/wsh' },
        SessionId: sessionId
      }
    });

    const res = await client.getWorkflowDetailsAsync({
      DIServiceInfo: {
        ServiceName: job.featuresValues.service.label,
      },
      FolderName: job.featuresValues.folder.label,
      WorkflowName: job.featuresValues.workflow.label,
      RequestMode: job.featuresValues.requestMode.id,
    });

    if (res && res.length > 0 && res[1]) {
      const resObj = parser.parse(res[1]);
      const resBody = resObj['soapenv:Envelope']['soapenv:Body']['ns1:GetWorkflowDetailsReturn'];

      return Response.success(JOB_STATES[resBody.WorkflowRunStatus] || JobStatus.AWAITING);
    }

    return Response.empty();
  } catch (error) {
    return Response.error('Failed to get status for workflow', { error });
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
    const url = getDataIntegrationWSDLUrl(job.featuresValues);

    const client = await soap.createClientAsync(url);

    const sessionId = await getSessionId(job.featuresValues);

    client.addSoapHeader({
      'ns0:Context': {
        attributes: { 'xmlns:ns0': 'http://www.informatica.com/wsh' },
        SessionId: sessionId
      }
    });

    const res = await client.getWorkflowLogAsync({
      DIServiceInfo: {
        ServiceName: job.featuresValues.service.label,
      },
      FolderName: job.featuresValues.folder.label,
      WorkflowName: job.featuresValues.workflow.label,
      Timeout: 5000,
    });

    if (res && res.length > 0 && res[1]) {
      const resObj = parser.parse(res[1]);
      const resLogs = resObj['soapenv:Envelope']['soapenv:Body']['ns1:GetWorkflowLogReturn'];

      if (resLogs) {
        const logs = resLogs.Buffer;
        const logsLines = logs.split('\n');

        return Response.success(logsLines.map((logLine) => Log(logLine, Stream.STDOUT, null)));
      }
    }

    return Response.empty();
  } catch (error) {
    return Response.error('Failed to get log for workflow', { error });
  }
};
