const axios = require('axios');
const { Response, Log, Stream } = require('@saagie/sdk');
const AdmZip = require('adm-zip');
const { ERRORS_MESSAGES } = require('./errors');

export const WORKFLOW_TYPE = 'WORKFLOW';

export const getV3RequestHeadersFromEndpointForm = (userData) => (
  { headers: { 'INFA-SESSION-ID': userData.icSessionId } }
);

export const getV2RequestHeadersFromEndpointForm = (userData) => (
  { headers: { icSessionId: userData.icSessionId } }
);

export const loginUser = async (featuresValues) => {
  const resultLogin = await axios.post(
    `${featuresValues.endpoint.url}/ma/api/v2/user/login`,
    {
      username: featuresValues.endpoint.username,
      password: featuresValues.endpoint.password,
    }
  );

  if (!resultLogin || !resultLogin.data) {
    return Response.error(ERRORS_MESSAGES.LOGIN_ERROR, { error: new Error(ERRORS_MESSAGES.LOGIN_ERROR) });
  }

  const { data: userData } = resultLogin;

  return userData;
};

export const getErrorMessage = (error, mainErrorMessage) => {
  if (error && error.response) {
    if (
      error.response.data
      && error.response.data['@type'] === 'error'
    ) {
      return Response.error(`${mainErrorMessage} : ${error.response.status} - ${error.response.statusText}`, { error: new Error(error.response.data.description) });
    }

    return Response.error(`${mainErrorMessage} : ${error.response.status} - ${error.response.statusText}`, { error: new Error(`${error.response.status} - ${error.response.statusText}`) });
  }

  return Response.error(mainErrorMessage, { error });
}

export const readLogs = async (userData, activityLogForJob) => {
  const resultSessionLog = await axios.get(
    `${userData.serverUrl}/api/v2/activity/activityLog/${activityLogForJob.id}/sessionLog`,
    {
      ...getV2RequestHeadersFromEndpointForm(userData),
      responseType: 'arraybuffer'
    }
  );

  if (!resultSessionLog || !resultSessionLog.data) {
    return Response.error(ERRORS_MESSAGES.NO_RESPONSE_FROM_INFORMATICA, { error: new Error(ERRORS_MESSAGES.NO_RESPONSE_FROM_INFORMATICA) });
  }

  const { data: sessionLog } = resultSessionLog;

  const zipBuffer = Buffer.from(sessionLog);

  let zip = null;
  let zipEntries = [];

  try {
    zip = new AdmZip(zipBuffer);
    zipEntries = zip.getEntries();
  } catch (e) {
    // If logs are not in a zip file, we do the request an other time to read logs directly from request data
    return readLogsInData(userData, activityLogForJob);
  }

  let logs = '';

  zipEntries.forEach((entry) => {
    const entryData = entry.getData();
    if (entryData && entryData.length > 0) {
      logs += entryData.toString('utf8');
    }
  });

  const logsLines = logs.split('\n');

  return Response.success(logsLines.map((line) => Log(line, Stream.STDOUT, null)));
};

const readLogsInData = async (userData, activityLogForJob) => {
  const resultSessionLog = await axios.get(
    `${userData.serverUrl}/api/v2/activity/activityLog/${activityLogForJob.id}/sessionLog`,
    getV2RequestHeadersFromEndpointForm(userData)
  );

  if (!resultSessionLog || !resultSessionLog.data) {
    return Response.error(ERRORS_MESSAGES.NO_RESPONSE_FROM_INFORMATICA, { error: new Error(ERRORS_MESSAGES.NO_RESPONSE_FROM_INFORMATICA) });
  }

  const { data: sessionLog } = resultSessionLog;

  const sessionLogLines = sessionLog.split('\n');
  
  return Response.success(sessionLogLines.map((line) => Log(line, Stream.STDOUT, null)));
};
