const axios = require('axios');
const https = require('https');
const fs = require('fs');
const extract = require('extract-zip');
const rimraf = require('rimraf');
const { Response, JobStatus, Log } = require('@saagie/sdk');

const agent = new https.Agent({  
  rejectUnauthorized: false
});

const getExistingOutputObjectForJob = async (job) => {
  try {
    const { data: result } = await axios.get(
      `${job.featuresValues.endpoint.url}/v4/outputObjects`,
      {
        httpsAgent: job.featuresValues.endpoint.ignoreSslIssues && job.featuresValues.endpoint.ignoreSslIssues.id ? agent : null,
        auth: {
          username: job.featuresValues.endpoint.email,
          password: job.featuresValues.endpoint.password
        }
      }
    );

    const { data } = result;

    const existingOutputObject = data.find((outputObject) => outputObject.flowNode.id === job.featuresValues.dataset.id);

    return existingOutputObject;
  } catch (error) {
    return null;
  }
}

/**
 * Logic to start the external job instance.
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data.
 */
exports.start = async ({ job, instance }) => {
  try {
    console.log('START INSTANCE:', instance);

    const parameters = [];

    if (job.featuresValues.first_parameter_key && job.featuresValues.first_parameter_value) {
      parameters.push({
        key: job.featuresValues.first_parameter_key,
        value: job.featuresValues.first_parameter_value
      });
    }

    if (job.featuresValues.second_parameter_key && job.featuresValues.second_parameter_value) {
      parameters.push({
        key: job.featuresValues.second_parameter_key,
        value: job.featuresValues.second_parameter_value
      });
    }

    let writeSettingsArray = [];

    try {
      if (job.featuresValues.writeSettings) {
        writeSettingsArray = JSON.parse(job.featuresValues.writeSettings);
      }
    } catch (error) {
      return Response.error('Error while parsing write settings', { error });
    }

    const overridesObj = {
      execution: job.featuresValues.execution && job.featuresValues.execution.id,
      profiler: job.featuresValues.profiler && job.featuresValues.profiler.id,
      isAdhoc: true,
    };

    if (writeSettingsArray && writeSettingsArray.length > 0) {
      overridesObj.writeSettings = writeSettingsArray;
    }

    if (job.featuresValues.writeSettingsSave && job.featuresValues.writeSettingsSave.id) {
      console.log('SAVING WRITE SETTINGS INTO OUTPUT OBJECT');
      // SAVE write settings into output object

      const existingOutputObjectForJob = await getExistingOutputObjectForJob(job);

      // Check if there is existing output object for selected wrangled dataset

      if (existingOutputObjectForJob && existingOutputObjectForJob.id) {
        console.log('UPDATING EXISTING OUTPUT OBJECT');
        await axios.put(
          `${job.featuresValues.endpoint.url}/v4/outputObjects/${existingOutputObjectForJob.id}`,
          overridesObj,
          {
            httpsAgent: job.featuresValues.endpoint.ignoreSslIssues && job.featuresValues.endpoint.ignoreSslIssues.id ? agent : null,
            auth: {
              username: job.featuresValues.endpoint.email,
              password: job.featuresValues.endpoint.password
            }
          }
        );
      } else {
        console.log('CREATE NEW OUTPUT OBJECT');
        await axios.post(
          `${job.featuresValues.endpoint.url}/v4/outputObjects`,
          {
            ...overridesObj,
            flowNode: {
              id: job.featuresValues.dataset.id
            }
          },
          {
            httpsAgent: job.featuresValues.endpoint.ignoreSslIssues && job.featuresValues.endpoint.ignoreSslIssues.id ? agent : null,
            auth: {
              username: job.featuresValues.endpoint.email,
              password: job.featuresValues.endpoint.password
            }
          }
        );
      }
    }

    const { data } = await axios.post(
      `${job.featuresValues.endpoint.url}/v4/jobGroups`,
      {
        wrangledDataset: {
          id: job.featuresValues.dataset.id,
        },
        runParameters: {
          overrides: {
            data: parameters
          }
        },
        overrides: !job.featuresValues.writeSettingsSave || !job.featuresValues.writeSettingsSave.id ? overridesObj : {},
      },
      {
        httpsAgent: job.featuresValues.endpoint.ignoreSslIssues && job.featuresValues.endpoint.ignoreSslIssues.id ? agent : null,
        auth: {
          username: job.featuresValues.endpoint.email,
          password: job.featuresValues.endpoint.password
        }
      }
    );

    // You can return any payload you want to get in the stop and getStatus functions.
    return Response.success({ jobGroupId: data.id });
  } catch (error) {
    if (error && error.response) {
      if (
        error.response.status === 400
        && error.response.data
        && error.response.data.exception
        && error.response.data.exception.name === 'ValidationFailed'
      ) {
        return Response.error('Failed to start job from Trifacta : if it\'s the first time that a job is run for the selected wrangled dataset, please complete job execution, profiler and write settings fields', { error: new Error(`${error.response.data.exception.name} - ${error.response.data.exception.message} : ${error.response.data.exception.details}`) });
      }

      if (error.response.data && error.response.data.exception) {
        return Response.error(`Failed to start job from Trifacta : ${error.response.data.exception.name} - ${error.response.data.exception.message} : ${error.response.data.exception.details}`, { error: new Error(`${error.response.data.exception.name} - ${error.response.data.exception.message} : ${error.response.data.exception.details}`) });
      }

      return Response.error(`Failed to start job from Trifacta : ${error.response.status} - ${error.response.statusText}`, { error: new Error(`${error.response.status} - ${error.response.statusText}`) });
    }

    return Response.error('Failed to obtain job result from Trifacta', { error });
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
      `${job.featuresValues.endpoint.url}/v4/jobGroups/${instance.payload.jobGroupId}/status`,
      {
        httpsAgent: job.featuresValues.endpoint.ignoreSslIssues && job.featuresValues.endpoint.ignoreSslIssues.id ? agent : null,
        auth: {
          username: job.featuresValues.endpoint.email,
          password: job.featuresValues.endpoint.password
        }
      }
    );

    switch (data) {
      case 'Created':
        return Response.success(JobStatus.QUEUED);
      case 'Pending':
        return Response.success(JobStatus.QUEUED);
      case 'InProgress':
        return Response.success(JobStatus.RUNNING);
      case 'Complete':
        return Response.success(JobStatus.SUCCEEDED);
      case 'Canceled':
        return Response.success(JobStatus.KILLED);
      case 'Failed':
        return Response.success(JobStatus.FAILED);
      default:
        return Response.success(JobStatus.AWAITING);
    }
  } catch (error) {
    if (error && error.response) {
      return Response.error(`Failed to get status for job from Trifacta : ${error.response.status} - ${error.response.statusText}`, { error: new Error(`${error.response.status} - ${error.response.statusText}`) });
    }

    return Response.error(`Failed to get status for job on dataset ${job.featuresValues.dataset.id}`, { error });
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
      `${job.featuresValues.endpoint.url}/v4/jobGroups/${instance.payload.jobGroupId}/logs`,
      {
        httpsAgent: job.featuresValues.endpoint.ignoreSslIssues && job.featuresValues.endpoint.ignoreSslIssues.id ? agent : null,
        auth: {
          username: job.featuresValues.endpoint.email,
          password: job.featuresValues.endpoint.password
        },
        responseType: 'arraybuffer'
      }
    );

    const jobLogsFilePath = `/tmp/job-${instance.payload.jobGroupId}-logs.zip`;
    const jobLogsFolderPath = `/tmp/job-${instance.payload.jobGroupId}-logs`;

    const { data } = result;

    if (fs.existsSync(jobLogsFilePath)) {
      fs.unlinkSync(jobLogsFilePath);
    }

    fs.appendFileSync(jobLogsFilePath, data);

    if (fs.existsSync(jobLogsFolderPath)) {
      rimraf.sync(jobLogsFolderPath);
    }

    await extract(jobLogsFilePath, { dir: '/tmp' });

    const directories = fs.readdirSync(jobLogsFolderPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)
      .filter(dirName => Number(dirName));

    let logs = '';

    directories.forEach((dir) => {
      const newLogs = fs.readFileSync(`${jobLogsFolderPath}/${dir}/job.log`, 'utf8');
      logs += newLogs;
    });

    const logsLines = logs.split('\n');

    return Response.success(logsLines.map((line) => {
      const logDate = line.substring(0, 23);
      const logContent = line.substring(24);
      return Log(logContent, null, logDate);
    }));
  } catch (error) {
    if (error && error.response) {
      return Response.error(`Failed to get logs for job from Trifacta : ${error.response.status} - ${error.response.statusText}`, { error: new Error(`${error.response.status} - ${error.response.statusText}`) });
    }

    return Response.error(`Failed to get log for dataset ${job.featuresValues.dataset.id}`, { error });
  }
};
