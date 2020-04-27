const axios = require('axios');
const { Response, JobStatus, Log, Stream } = require('@saagie/sdk');
const fs = require('fs');
const extract = require('extract-zip');
const rimraf = require('rimraf');
const dayjs =  require('dayjs');
const { JOB_STATES } = require('../job-states');
const { getRequestConfigFromEndpointForm } = require('./utils');
const { ERRORS_MESSAGES } = require('../errors');

const getLogsForAJob = (logsLines, lineIndex, jobIdString) => {
  let currentLineIndex = lineIndex;
  let logs = [];

  if (logsLines && logsLines.length > currentLineIndex) {
    // We are detecting if the current line is the first of a log block (start by a date) for the selected job
    const maybeDate = logsLines[currentLineIndex].substring(0, 19);
    let isAValidDate = dayjs(maybeDate).isValid();

    if (isAValidDate && logsLines[currentLineIndex].includes(jobIdString)) {
      // We add the first log block for the selected job
      logs.push(logsLines[currentLineIndex]);

      do {
        // We add log block lines until to find a new log block (next line to start by a date)
        if (logsLines.length > currentLineIndex + 1) {
          const maybeDate = logsLines[currentLineIndex + 1].substring(0, 19);
          isAValidDate = dayjs(maybeDate).isValid();
          if (!isAValidDate) {
            logs.push(logsLines[currentLineIndex + 1]);
            currentLineIndex++;
          }
        }
      } while (!isAValidDate && logsLines.length > currentLineIndex + 1);
    }

    if (logsLines && logsLines.length > currentLineIndex + 1) {
      // We go to the next line to find a new log block for the selected job
      return [
        ...logs,
        ...getLogsForAJob(logsLines, currentLineIndex + 1, jobIdString),
      ];
    }
  }

  return logs;
};

/**
 * Logic to start the external job instance.
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data.
 */
exports.start = async ({ job, instance }) => {
  try {
    console.log('START INSTANCE:', instance);

    let jobId = job.featuresValues.job.id;

    if (job.featuresValues.job.id === 'run-new-job') {
      const resultJobCreation = await axios.post(
        `${job.featuresValues.endpoint.url}/rest/v4/repository${job.featuresValues.workflow.id}:jobs`,
        {},
        getRequestConfigFromEndpointForm(job.featuresValues.endpoint)
      );

      if (resultJobCreation && resultJobCreation.data && resultJobCreation.data.id) {
        jobId = resultJobCreation.data.id;
      } else {
        return Response.error(ERRORS_MESSAGES.FAILED_TO_RUN_JOB_ERROR, { error: new Error(ERRORS_MESSAGES.FAILED_TO_RUN_JOB_ERROR) });
      }
    }

    const result = await axios.post(
      `${job.featuresValues.endpoint.url}/rest/v4/jobs/${jobId}`,
      {},
      getRequestConfigFromEndpointForm(job.featuresValues.endpoint)
    );

    if (!result) {
      return Response.error(ERRORS_MESSAGES.NO_RESPONSE_FROM_KNIME, { error: new Error(ERRORS_MESSAGES.NO_RESPONSE_FROM_KNIME) });
    }

    const { data } = result;

    // You can return any payload you want to get in the stop and getStatus functions.
    return Response.success(data);
  } catch (error) {
    if (error && error.response) {
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

    const result = await axios.get(
      `${job.featuresValues.endpoint.url}/rest/v4/jobs/${(instance && instance.payload && instance.payload.id) || job.featuresValues.job.id}`,
      getRequestConfigFromEndpointForm(job.featuresValues.endpoint)
    );

    if (!result) {
      return Response.error(ERRORS_MESSAGES.NO_RESPONSE_FROM_KNIME, { error: new Error(ERRORS_MESSAGES.NO_RESPONSE_FROM_KNIME) });
    }

    const { data } = result;

    if (!data || !data.state) {
      return Response.error(ERRORS_MESSAGES.FAILED_TO_GET_STATUS_ERROR, { error: new Error(ERRORS_MESSAGES.FAILED_TO_GET_STATUS_ERROR) });
    }

    return Response.success(JOB_STATES[data.state] || JobStatus.AWAITING);
  } catch (error) {
    if (error && error.response) {
      return Response.error(`${ERRORS_MESSAGES.FAILED_TO_GET_STATUS_ERROR} : ${error.response.status} - ${error.response.statusText}`, { error: new Error(`${error.response.status} - ${error.response.statusText}`) });
    }

    return Response.error(ERRORS_MESSAGES.FAILED_TO_GET_STATUS_ERROR, { error });
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
    const result = await axios.get(
      `${job.featuresValues.endpoint.url}/rest/v4/admin/logs`,
      {
        ...getRequestConfigFromEndpointForm(job.featuresValues.endpoint),
        responseType: 'arraybuffer'
      }
    );

    if (!result) {
      return Response.error(ERRORS_MESSAGES.NO_RESPONSE_FROM_KNIME, { error: new Error(ERRORS_MESSAGES.NO_RESPONSE_FROM_KNIME) });
    }

    const jobLogsFilePath = '/tmp/knime-logs.zip';
    const jobLogsFolderPath = '/tmp/knime-logs';

    const { data } = result;

    if (!data) {
      return Response.error(ERRORS_MESSAGES.FAILED_TO_GET_LOGS_ERROR, { error: new Error(ERRORS_MESSAGES.FAILED_TO_GET_LOGS_ERROR) });
    }

    if (fs.existsSync(jobLogsFilePath)) {
      fs.unlinkSync(jobLogsFilePath);
    }

    fs.appendFileSync(jobLogsFilePath, data);

    if (fs.existsSync(jobLogsFolderPath)) {
      rimraf.sync(jobLogsFolderPath);
    }

    await extract(jobLogsFilePath, { dir: jobLogsFolderPath });

    const directories = fs.readdirSync(jobLogsFolderPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    const jobIdString = `: ${(instance && instance.payload && instance.payload.id) || job.featuresValues.job.id} :`;

    let jobLogs = [];

    directories.forEach((dir) => {
      if (fs.existsSync(`${jobLogsFolderPath}/${dir}/knime.log`)) {

        // We are getting all lines in new log file
        const newLogs = fs.readFileSync(`${jobLogsFolderPath}/${dir}/knime.log`, 'utf8');

        const logsLines = newLogs.split('\n');

        if (logsLines && logsLines.length > 0) {
          jobLogs = jobLogs.concat(getLogsForAJob(logsLines, 0, jobIdString));
        }
      }
    });

    return Response.success(jobLogs.map(
      (jobLogLine) => {
        const maybeDate = jobLogLine.substring(0, 19);
        const isAValidDate = dayjs(maybeDate).isValid();
        return Log(jobLogLine, Stream.STDOUT, isAValidDate && maybeDate);
      }
    ));
  } catch (error) {
    if (error && error.response) {
      if (error.response.status === 403) {
        return Response.error(ERRORS_MESSAGES.LOGS_FORBIDDEN_ERROR, { error: new Error(`${error.response.status} - ${error.response.statusText}`) });
      }

      return Response.error(`${ERRORS_MESSAGES.FAILED_TO_GET_LOGS_ERROR} : ${error.response.status} - ${error.response.statusText}`, { error: new Error(`${error.response.status} - ${error.response.statusText}`) });
    }

    return Response.error(ERRORS_MESSAGES.FAILED_TO_GET_LOGS_ERROR, { error });
  }
};
