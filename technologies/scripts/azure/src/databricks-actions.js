import {buildClient} from './client';
import {JobStatus} from './JobStatus';

const start = async (connection, parameters, jobToCreate) => {
    const client = await buildClient(connection);
    if (parameters.jobParameters) {
        jobToCreate.notebook_task.base_parameters = JSON.parse(parameters.jobParameters);
    }
    const {data} = await client.databricks.createJob(parameters.workspace.url, jobToCreate);
    const {data: runData} = await client.databricks.runJob(parameters.workspace.url, data.job_id)
    return {
        run_id: runData.run_id,
    };
};

exports.startNotebook = ({connection, parameters}) => {
    const jobToCreate = {
        name: parameters.jobName,
        new_cluster: {
            spark_version: "7.0.x-scala2.12",
            node_type_id: "Standard_D3_v2",
            num_workers: 1,
            cluster_log_conf: {
                dbfs: {
                    destination: 'dbfs:/logs',
                }
            }
        },
        notebook_task: {
            base_parameters: [],
            notebook_path: parameters.notebook.label
        }
    };
    if (parameters.jobParameters) {
        jobToCreate.notebook_task.base_parameters = JSON.parse(parameters.jobParameters);
    }
    return start(connection, parameters, jobToCreate);
}

exports.startSpark = async ({connection, parameters}) => {
    const jobToCreate = {
        name: parameters.jobName,
        new_cluster: {
            spark_version: "7.0.x-scala2.12",
            node_type_id: "Standard_D3_v2",
            num_workers: 1,
            cluster_log_conf: {
                dbfs: {
                    destination: 'dbfs:/logs',
                }
            }
        },
        spark_submit_task: {
            parameters: JSON.parse(parameters.jobParameters)
        }
    };
    return start(connection, parameters, jobToCreate);
};

exports.startExisting = async ({connection, parameters}) => {
    const client = await buildClient(connection);
    const {data: runData} = await client.databricks.runJob(parameters.workspace.url, parameters.job)
    return {
        run_id: runData.run_id,
    };
};

exports.stop = async ({connection, parameters, payload}) => {
    const client = await buildClient(connection);
    await client.databricks.cancelJob(parameters.workspace.url, payload.run_id);
};

const STATUS_MAPPING = {
    'Queued': JobStatus.QUEUED,
    'NotStarted': JobStatus.QUEUED,
    'CancelRequested': JobStatus.KILLING,
    'Canceled': JobStatus.KILLED,
    'Preparing': JobStatus.RUNNING,
    'Running': JobStatus.RUNNING,
    'Starting': JobStatus.RUNNING,
    'Finished': JobStatus.SUCCEEDED,
    'Completed': JobStatus.SUCCEEDED,
    'Failed': JobStatus.FAILED,
};

exports.getStatus = async ({connection, parameters, payload}) => {
    const client = await buildClient(connection);
    const {data} = await client.databricks.getRunJob(parameters.workspace.url, payload.run_id);
    return STATUS_MAPPING[data?.state?.life_cycle_state]
        || STATUS_MAPPING[data?.state?.result_state]
        || JobStatus.AWAITING;
};

exports.getLogs = async ({connection, parameters, payload}) => {
    const client = await buildClient(connection);

    const {data: runData} = await client.databricks.getRunJob(parameters.workspace.url, payload.run_id);

    const clusterId = runData.cluster_instance.cluster_id;

    const {data: clusterData} = await client.databricks.getCluster(parameters.workspace.url, clusterId);

    const logsDestination = clusterData.cluster_log_conf.dbfs.destination;

    const {data: dataLogs} = await client.databricks.getClusterLogs(parameters.workspace.url, logsDestination, clusterId);

    const logsBuffer = new Buffer.from(dataLogs.data, 'base64');
    const logsContent = logsBuffer.toString('utf8');
    const logsLines = logsContent.split('\n');
    return logsLines.map((logLine) => Log(logLine));
};
