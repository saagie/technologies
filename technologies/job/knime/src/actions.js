import {buildClient} from './client';
import {JobStatus} from "./JobStatus";

// TODO rework how logs are extracted
// const fs = require('fs');
// const extract = require('extract-zip');
// const rimraf = require('rimraf');
// const dayjs = require('dayjs');

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

exports.start = async ({connection, parameters}) => {
    const client = buildClient(connection);
    let jobId = parameters.job;
    if (parameters.job === 'run-new-job') {
        const resultJobCreation = await client.createJob(parameters.workflow);
        jobId = resultJobCreation.data.id;
    }
    const result = await client.runJob(jobId);
    return result.data;
};

const STATUS_MAPPING = {
    'UNDEFINED': JobStatus.AWAITING,
    'CONFIGURED': JobStatus.QUEUED,
    'IDLE': JobStatus.FAILED,
    'DISCARDED': JobStatus.FAILED,
    'EXECUTING': JobStatus.RUNNING,
    'EXECUTED': JobStatus.SUCCEEDED,
};

exports.getStatus = async ({connection,parameters, payload}) => {
    const client = buildClient(connection);
    const result = await client.getJob(payload?.id ?? parameters.job);
    return STATUS_MAPPING[result.data.state] || JobStatus.AWAITING;
};

exports.getLogs = async ({connection, instance}) => {
    const client = buildClient(connection);
    const result = await client.getLogs();
    const jobLogsFilePath = '/tmp/knime-logs.zip';
    const jobLogsFolderPath = '/tmp/knime-logs';
    if (fs.existsSync(jobLogsFilePath)) {
        fs.unlinkSync(jobLogsFilePath);
    }

    fs.appendFileSync(jobLogsFilePath, result.data);

    if (fs.existsSync(jobLogsFolderPath)) {
        rimraf.sync(jobLogsFolderPath);
    }

    await extract(jobLogsFilePath, {dir: jobLogsFolderPath});

    const directories = fs.readdirSync(jobLogsFolderPath, {withFileTypes: true})
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    const jobIdString = `: ${(instance && instance.payload && instance.payload.id) || job.featuresValues.job.id} :`;

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

    return jobLogs.map(
        (jobLogLine) => {
            const maybeDate = jobLogLine.substring(0, 19);
            const isAValidDate = dayjs(maybeDate).isValid();
            return Log(jobLogLine, Stream.STDOUT, isAValidDate ? maybeDate : undefined);
        }
    );
};
