import {buildClient} from './client';
import {JobStatus} from './JobStatus';

exports.start = async ({connection, parameters}) => {
    const client = buildClient(connection);

    const {data} = await client.sageMaker.describeTrainingJob(parameters.trainingjobs);

    const jobInput = parameters.trainingjobinput ?? data.InputDataConfig[0].DataSource.S3DataSource.S3Uri;
    const jobOutput = parameters.trainingjoboutput ?? data.OutputDataConfig.S3OutputPath;

    const {data: clone} = await client.sageMaker.createTrainingJob({
        AlgorithmSpecification: {
            TrainingInputMode: data.AlgorithmSpecification.TrainingInputMode,
            AlgorithmName: data.AlgorithmSpecification.AlgorithmName,
            EnableSageMakerMetricsTimeSeries: data.AlgorithmSpecification.EnableSageMakerMetricsTimeSeries,
            TrainingImage: data.AlgorithmSpecification.TrainingImage
        },
        OutputDataConfig: {
            S3OutputPath: jobOutput
        },
        ResourceConfig: data.ResourceConfig,
        RoleArn: data.RoleArn,
        StoppingCondition: data.StoppingCondition,
        TrainingJobName: parameters.trainingjobname,
        DebugHookConfig: data.DebugHookConfig,
        DebugRuleConfigurations: data.DebugRuleConfigurations,
        EnableInterContainerTrafficEncryption: data.EnableInterContainerTrafficEncryption,
        EnableManagedSpotTraining: data.EnableManagedSpotTraining,
        EnableNetworkIsolation: data.EnableNetworkIsolation,
        ExperimentConfig: data.ExperimentConfig,
        HyperParameters: data.HyperParameters,
        InputDataConfig: [
            {
                ChannelName: 'train',
                DataSource: {
                    S3DataSource: {
                        S3DataType: 'S3Prefix',
                        S3Uri: jobInput,
                        S3DataDistributionType: 'FullyReplicated',
                    }
                },
                CompressionType: 'None',
                InputMode: 'File'
            }
        ],
        Tags: data.Tags
    });
    return {customId: clone.TrainingJobArn};
};

exports.stop = async ({connection, parameters}) => {
    const client = buildClient(connection);
    await client.sageMaker.stopTrainingJob(parameters.trainingjobname);
};

const STATUS_MAPPING = {
    Stopping: JobStatus.KILLING,
    InProgress: JobStatus.RUNNING,
    Completed: JobStatus.SUCCEEDED,
    Stopped: JobStatus.KILLED,
    Failed: JobStatus.FAILED,
};

exports.getStatus = async ({connection, parameters}) => {
    const client = buildClient(connection);
    const {data} = await client.sageMaker.describeTrainingJob(parameters.trainingjobname);
    return STATUS_MAPPING[data.TrainingJobStatus];
};

exports.getLogs = async ({connection, parameters}) => {
    const client = buildClient(connection);
    return client.filteredLogsStream('/aws/sagemaker/TrainingJobs', parameters.trainingjobname);
};
