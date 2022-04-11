import {buildClient} from './client';
import {JobStatus} from './JobStatus';
import {Transform} from 'stream';
import {splitStringStream} from "./split-stream";
import {concatStream} from "./concat-stream";

exports.start = async ({connection, parameters}) => {
    const client = buildClient(connection);
    const {data} = await client.emr.describeStep({
        ClusterId: parameters.clusters,
        StepId: parameters.steps
    });

    const clonestep = {
        Name: parameters.name,
        HadoopJarStep: {
            Jar: data.Step.Config.Jar,
        }
    };
    if (data.Step.Config.Args && data.Step.Config.Args.length > 0) {
        clonestep.HadoopJarStep.Args = data.Step.Config.Args;
    }
    if (data.Step.Config.MainClass) {
        clonestep.HadoopJarStep.MainClass = data.Step.Config.MainClass;
    }
    if (data.Step.Config.Properties && Object.keys(data.Step.Config.Properties).length > 0) {
        clonestep.HadoopJarStep.Properties = [data.Step.Config.Properties];
    }
    if (data.Step.ActionOnFailure) {
        clonestep.ActionOnFailure = data.Step.ActionOnFailure;
    }

    const {data: clone} = await client.emr.addJobFlowSteps({
        JobFlowId: parameters.clusters,
        Steps: [clonestep]
    });

    return {stepId: clone.StepIds[0]};
};

exports.stop = async ({connection, parameters, payload}) => {
    const client = buildClient(connection);
    await client.cancelSteps({
        ClusterId: parameters.clusters,
        StepIds: [payload.stepId]
    });
};

const STATUS_MAPPING = {
    PENDING: JobStatus.QUEUED,
    CANCEL_PENDING: JobStatus.KILLING,
    RUNNING: JobStatus.RUNNING,
    COMPLETED: JobStatus.SUCCEEDED,
    CANCELLED: JobStatus.KILLED,
    FAILED: JobStatus.FAILED,
    INTERRUPTED: JobStatus.FAILED
};

exports.getStatus = async ({connection, parameters, payload}) => {
    const client = buildClient(connection);
    const {data} = await client.emr.describeStep({
        ClusterId: parameters.clusters,
        StepId: payload.stepId
    });
    return STATUS_MAPPING[data.Step.Status.State];
};

exports.getLogs = async ({connection, parameters, payload}) => {
    const client = buildClient(connection);
    const {data} = await client.emr.describeCluster(parameters.clusters);
    const s3uri = `${data.Cluster.LogUri}${parameters.clusters}/steps/${payload.stepId}/`;
    const urisplitted = s3uri.split('/');
    const bucket = urisplitted[2];
    const key = s3uri.substring(7 + bucket.length);

    const {data: directory} = await client.s3.listObjectsV2(bucket, key);

    if (directory.ListBucketResult.KeyCount === 0) {
        return [];
    }

    let fileIndex = 0;
    return concatStream({
        readableObjectMode: true,
        writableObjectMode: true,
    }, async () => {
        if (fileIndex >= directory.ListBucketResult.Contents.length) {
            return null;
        }
        const file = directory.ListBucketResult.Contents[fileIndex];
        fileIndex += 1;

        const response = await client.s3.getObject(bucket, file.Key);
        let timestamp = Date.parse(response.headers['last-modified']);
        if (isNaN(timestamp)) {
            timestamp = new Date().getTime();
        }

        return response.data
            .pipe(splitStringStream(/\r?\n/))
            .pipe(new Transform({
                writableObjectMode: true,
                readableObjectMode: true,
                transform(chunk, encoding, callback) {
                    callback(null, {timestamp, log: chunk});
                }
            }));
    });
};
