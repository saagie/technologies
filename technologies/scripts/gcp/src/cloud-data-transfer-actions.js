import {buildClient} from './client';
import {JobStatus} from './JobStatus';

const moment = require('moment-timezone');

exports.startTransferAzure = ({connection, parameters}) => start(connection, parameters, {
    azureBlobStorageDataSource: {
        container: parameters.containerName,
        storageAccount: parameters.storageAccountName,
        azureCredentials: {
            sasToken: parameters.sapToken
        },
    }
});

exports.startTransferS3 = ({connection, parameters}) => start(connection, parameters, {
    awsS3DataSource: {
        bucketName: parameters.S3bucketName,
        awsAccessKey: {
            accessKeyId: parameters.accessKeyID,
            secretAccessKey: parameters.secretKeyID
        },
    },
});

exports.startTransferGCS = ({connection, parameters}) => start(connection, parameters, {
    gcsDataSource: {
        bucketName: parameters.sourceBucket,
    },
});

exports.startTransferTSV = ({connection, parameters}) => start(connection, parameters, {
    httpDataSource: {
        listUrl: parameters.tsvFileURL,
    },
});

const start = async (connection, parameters, customConfig) => {
    const client = await buildClient(connection);
    const currentDate = moment();

    const currentDayMonthYear = {day: currentDate.day(), month: currentDate.month(), year: currentDate.year()};

    const runObject = {
        projectId: parameters.project,
        description: parameters.jobName,
        status: 'ENABLED',
        schedule: {
            scheduleStartDate: currentDayMonthYear,
        },
        transferSpec: {
            ...customConfig,
            gcsDataSink: {
                bucketName: parameters.destinationBucket,
            },
            transferOptions: {
                deleteObjectsFromSourceAfterTransfer: false,
                deleteObjectsUniqueInSink: false,
                overwriteObjectsAlreadyExistingInSink: false
            }
        }
    };

    if (parameters.dailyExecutionHour && parameters.dailyExecutionHour.length > 0) {
        // DAILY RUN IF DAILY EXECUTION HOUR HAS BEEN INSERTED
        const dailyHour = moment(parameters.dailyExecutionHour, 'HH:mm');

        if (!dailyHour.isValid()) {
            return Response.error('Error while parsing the daily execution hour', new Error('Error while parsing the daily execution hour'));
        }

        const dailyHourUTC = dailyHour.utc();

        if (dailyHourUTC) {
            runObject.schedule.startTimeOfDay = {
                hours: dailyHourUTC.hour(),
                minutes: dailyHourUTC.minute(),
                seconds: 0,
                nanos: 0,
            };
        }
    } else {
        // RUN EXECUTED ONCE
        runObject.schedule.scheduleEndDate = currentDayMonthYear;
    }

    const {data} = await client.storagetransfer.transferJobs.create({
        requestBody: runObject
    });

    return data;
};

export const stop = async ({connection, parameters, payload}) => {
    const client = await buildClient(connection);
    const filterOptions = {
        project_id: parameters.project,
        job_names: [payload.name]
    };

    const filterOptionsString = JSON.stringify(filterOptions);

    // WE LIST ALL TRANSFER OPERATIONS LINKED TO TRANSFER JOB
    const {data: {operations}} = await client.storagetransfer.transferOperations.list({filter: filterOptionsString});

    let promises = [];

    if (operations && operations.length > 0) {
        promises = operations.map(async (operation) => {
            await client.storagetransfer.transferOperations.cancel(operation.name);
        });
    }

    // WE CANCEL ALL TRANSFER OPERATIONS LINKED TO TRANSFER JOB
    await Promise.all(promises);
};

const STATUS_MAPPING = {
    'IN_PROGRESS': JobStatus.RUNNING,
    'PAUSED': JobStatus.KILLED,
    'SUCCESS': JobStatus.SUCCEEDED,
    'FAILED': JobStatus.FAILED,
    'ABORTED': JobStatus.KILLED
};

export const getStatus = async ({connection, parameters, payload}) => {
    const client = await buildClient(connection);

    const filterOptions = {
        project_id: parameters.project,
        job_names: [payload.name]
    };

    const filterOptionsString = JSON.stringify(filterOptions);

    // WE LIST ALL TRANSFER OPERATIONS LINKED TO TRANSFER JOB
    const {data: {operations}} = await client.storagetransfer.transferOperations.list({
        name: 'transferOperations',
        filter: filterOptionsString
    });

    if (operations && operations.length > 0) {
        // WE GET LAST OPERATION STATUS
        const {metadata} = operations[operations.length - 1];

        return STATUS_MAPPING[metadata.status] || JobStatus.AWAITING;
    }

    return JobStatus.AWAITING;
};

