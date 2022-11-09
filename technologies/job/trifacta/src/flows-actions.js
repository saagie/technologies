import {buildClient} from './client';
import {JobStatus, StatusMapping} from './JobStatus';

exports.start = async ({connection, parameters}) => {
    const client = buildClient(connection);
    const runParameters = [];
    if (parameters.first_parameter_key && parameters.first_parameter_value) {
        runParameters.push({
            key: parameters.first_parameter_key,
            value: parameters.first_parameter_value
        });
    }
    if (parameters.second_parameter_key && parameters.second_parameter_value) {
        runParameters.push({
            key: parameters.second_parameter_key,
            value: parameters.second_parameter_value
        });
    }

    let writeSettingsArray = [];
    if (parameters.writeSettings) {
        writeSettingsArray = JSON.parse(parameters.writeSettings);
    }

    const overridesObj = {
        execution: parameters.execution && parameters.execution,
        profiler: parameters.profiler && parameters.profiler,
        isAdhoc: true,
    };

    if (parameters.writeSettingsSave && parameters.writeSettingsSave) {
        console.log('SAVING WRITE SETTINGS INTO OUTPUT OBJECT');
        // SAVE write settings into output object
        const {data: {data}} = await client.getOutputObjects();
        const existingOutputObjectForJob = data.find((outputObject) => outputObject.flowNode.id === parameters.dataset);

        if (writeSettingsArray && writeSettingsArray.length > 0) {
            overridesObj.writeSettings = writeSettingsArray;
        }

        // Check if there is existing output object for selected wrangled dataset

        if (existingOutputObjectForJob && existingOutputObjectForJob.id) {
            console.log('UPDATING EXISTING OUTPUT OBJECT');
            await client.updateOutputObject(existingOutputObjectForJob.id, overridesObj);
        } else {
            console.log('CREATE NEW OUTPUT OBJECT');
            await client.createOutputObject({
                ...overridesObj,
                flowNode: {
                    id: parameters.dataset
                }
            });
        }
    } else if (writeSettingsArray && writeSettingsArray.length > 0) {
        overridesObj.writesettings = writeSettingsArray;
    }

    const {data} = await client.createJobGroups({
        wrangledDataset: {
            id: parameters.dataset,
        },
        runParameters: {
            overrides: {
                data: runParameters
            }
        },
        overrides: !parameters.writeSettingsSave ? overridesObj : {},
    });

    return {jobGroupId: data.id};
};

exports.stop = async ({connection, payload}) => {
    const client = buildClient(connection);
    await client.cancelJobGroup(payload.jobGroupId);
};

exports.getStatus = async ({connection, payload}) => {
    const client = buildClient(connection);
    const {data} = await client.getJobGroupStatus(payload.jobGroupId);
    return StatusMapping[data] || JobStatus.AWAITING;
};

exports.getLogs = async ({connection, payload}) => {
    const client = buildClient(connection);
    const {data: logsData} = await client.getJobGroupLogs(payload.jobGroupId);
    const logsLines = await extractLogs(logsData, payload.jobGroupId);
    return logsLines.map((line) => {
        const logDate = line.substring(0, 23);
        const logContent = line.substring(24);
        return Log(logContent, Stream.STDOUT, logDate);
    });
};
