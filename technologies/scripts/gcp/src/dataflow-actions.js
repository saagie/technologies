import {buildClient} from './client';
import {JobStatus} from './JobStatus';

exports.startNew = async ({connection, parameters}) => {
    const client = await buildClient(connection);
    let jsonParameters = null;
    try {
        jsonParameters = JSON.parse(parameters.jsonParameters);
    } catch (e) {
        console.warn('No parameters readable for template');
    }
    const {data: {job: newJob}} = await client.dataflow.projects.locations.templates.launch(
        parameters.project,
        parameters.region,
        {
            gcsPath: parameters.templatePath
        },
        {
            jobName: parameters.jobName,
            parameters: jsonParameters,
        }
    );
    return newJob;
};

exports.startClone = async ({connection, parameters}) => {
    const client = await buildClient(connection);

    // Getting current job details and options
    const {data: jobData} = await client.dataflow.projects.locations.jobs.get(
        parameters.project,
        parameters.region,
        parameters.job,
        {
            view: 'JOB_VIEW_DESCRIPTION',
        }
    );

    const {pipelineDescription: {displayData: jobOptions}} = jobData;

    const gcsPath = jobOptions.find((option) => option.key === 'templateLocation').strValue;

    // Getting current job template details and accepted parameters
    const {data: templateData} = await client.dataflow.projects.locations.templates.get(parameters.project, parameters.region, {gcsPath});

    const availableTemplateParameters = templateData.metadata.parameters;

    const params = {};

    // Filter only accepted parameters on job template
    jobOptions.forEach((option) => {
        if (availableTemplateParameters.find((param) => param.name === option.key)) {
            params[option.key] = option.strValue;
        }
    });

    // Launch a new job with selected job parameters
    const {data: {job: newJob}} = await client.dataflow.projects.locations.templates.launch(
        parameters.project,
        parameters.region,
        {
            gcsPath
        },
        {
            jobName: parameters.clonedJobName || parameters.job.label,
            parameters: params,
        },
    );

    return newJob;
};

exports.stop = async ({connection, parameters, payload}) => {
    const client = await buildClient(connection);
    await client.dataflow.projects.locations.jobs.update(
        parameters.project,
        parameters.region,
        payload?.id,
        {
            requestedState: 'JOB_STATE_CANCELLED',
        },
    );
};

const STATUS_MAPPING = {
    'JOB_STATE_STOPPED': JobStatus.KILLED,
    'JOB_STATE_RUNNING': JobStatus.RUNNING,
    'JOB_STATE_DONE': JobStatus.SUCCEEDED,
    'JOB_STATE_FAILED': JobStatus.FAILED,
    'JOB_STATE_CANCELLED': JobStatus.KILLED,
    'JOB_STATE_UPDATED': JobStatus.KILLED,
    'JOB_STATE_DRAINING': JobStatus.KILLING,
    'JOB_STATE_DRAINED': JobStatus.KILLED,
    'JOB_STATE_PENDING': JobStatus.QUEUED,
    'JOB_STATE_CANCELLING': JobStatus.KILLING,
    'JOB_STATE_QUEUED': JobStatus.QUEUED,
    'JOB_STATE_UNKNOWN': JobStatus.AWAITING,
};

exports.getStatus = async ({connection, parameters, payload}) => {
    const client = await buildClient(connection);
    const {data} = await client.dataflow.projects.locations.jobs.get({
        projectId: parameters.project,
        location: parameters.region,
        jobId: payload?.id,
    });

    return STATUS_MAPPING[data.currentState] || JobStatus.AWAITING;
};

exports.getLogs = async ({connection, parameters, payload}) => {
    const client = await buildClient(connection);
    return client.getLogs({
        requestBody: {
            filter: `resource.type="dataflow_step" resource.labels.job_id="${payload?.id}" logName="projects/${parameters.project}/logs/dataflow.googleapis.com%2Fjob-message"`,
            orderBy: "timestamp desc",
            resourceNames: [`projects/${parameters.project}`]
        }
    });
};
