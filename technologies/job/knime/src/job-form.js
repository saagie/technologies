import {buildClient} from './client';

const getWorkflowGroupsRecursive = (currentWorflowGroup) => {
    let subchildrenWorflowGroups = [];
    if (currentWorflowGroup.children && currentWorflowGroup.children.length > 0) {
        const childrenWorkflowGroups = currentWorflowGroup.children.filter((element) => element.type === 'WorkflowGroup');
        childrenWorkflowGroups.forEach((wg) => {
            subchildrenWorflowGroups = subchildrenWorflowGroups.concat(getWorkflowGroupsRecursive(wg));
        });
    }
    return [currentWorflowGroup, ...subchildrenWorflowGroups];
};

const getWorkflowsRecursive = (currentWorflowGroup) => {
    let subchildrenWorflowGroups = [];
    let childrenWorkflows = [];
    if (currentWorflowGroup.children && currentWorflowGroup.children.length > 0) {
        const childrenWorkflowGroups = currentWorflowGroup.children.filter((element) => element.type === 'WorkflowGroup');
        childrenWorkflowGroups.forEach((wg) => {
            subchildrenWorflowGroups = subchildrenWorflowGroups.concat(getWorkflowsRecursive(wg));
        });
        childrenWorkflows = currentWorflowGroup.children.filter((element) => element.type === 'Workflow');
    }
    return [...childrenWorkflows, ...subchildrenWorflowGroups];
};

exports.getWorkflowGroups = async ({connection}) => {
    const client = buildClient(connection);
    const {data: repository} = await client.getRepository();
    if (!repository) {
        return [];
    }
    const workflowGroups = getWorkflowGroupsRecursive(repository);
    return workflowGroups?.map((workflowGroup) => ({
        id: workflowGroup.path,
        data: workflowGroup, // TODO remove extra data
        label: workflowGroup.path
    })) ?? [];
};

exports.getWorkflows = async ({parameters}) => {
    const workflows = getWorkflowsRecursive(parameters.workflowGroup.data);
    return workflows?.map((workflow) => ({
        id: workflow.path,
        label: workflow.path
    })) ?? [];
};

exports.getJobs = async ({connection}) => {
    const client = buildClient(connection);
    const {data} = client.getJobs();
    const jobs = data?.jobs;
    const runNewJobOption = {
        id: 'run-new-job',
        label: 'Run new job for selected workflow'
    };
    if (!jobs) {
        return [runNewJobOption];
    }
    return [
        ...jobs.map((job) => ({
            id: job.id,
            label: job.name
        })),
        runNewJobOption
    ];
};
