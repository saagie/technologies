const axios = require('axios');
const { Response, JobStatus, Log, Stream } = require('@saagie/sdk');
const fs = require('fs');
const extract = require('extract-zip');
const rimraf = require('rimraf');
const dayjs =  require('dayjs');

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
    const result = await axios.post(
      `${job.featuresValues.endpoint.url}/rest/v4/jobs/${job.featuresValues.job.id}`,
      {},
      {
        auth: {
          username: job.featuresValues.endpoint.username,
          password: job.featuresValues.endpoint.password
        }
      }
    );

    const { data } = result;

    // You can return any payload you want to get in the stop and getStatus functions.
    return Response.success(data);
  } catch (error) {
    return Response.error('Fail to start job', { error, url: `${job.featuresValues.endpoint.url}/api/demo/datasets/${job.featuresValues.dataset.id}/start` });
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
      `${job.featuresValues.endpoint.url}/rest/v4/jobs/${job.featuresValues.job.id}`,
      {
        auth: {
          username: job.featuresValues.endpoint.username,
          password: job.featuresValues.endpoint.password
        }
      }
    );

    const { data } = result;

    switch (data.state) {
      case 'EXECUTING':
        return Response.success(JobStatus.RUNNING);
      case 'CONFIGURED_QUEUED':
        return Response.success(JobStatus.QUEUED);
        case 'EXECUTED':
          return Response.success(JobStatus.SUCCEEDED);
      default:
        return Response.success(JobStatus.AWAITING);
    }
  } catch (error) {
    return Response.error('Failed to get status', { error });
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
        auth: {
          username: job.featuresValues.endpoint.username,
          password: job.featuresValues.endpoint.password
        },
        responseType: 'arraybuffer'
      }
    );

    const jobLogsFilePath = '/tmp/knime-logs.zip';
    const jobLogsFolderPath = '/tmp/knime-logs';

    const { data } = result;

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

    const jobIdString = `: ${job.featuresValues.job.id} :`;

    console.log({ jobIdString });

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

    return Response.success(jobLogs.map((jobLogLine) => Log(jobLogLine, Stream.STDOUT, null)));
  } catch (error) {
    console.log({ error });
    return Response.error('Failed to get logs', { error });
  }
};
