const axios = require('axios');
const { Response } = require('@saagie/sdk');
const { getRequestConfigFromEndpointForm, RUN_NEW_JOB } = require('./utils');
const { ERRORS_MESSAGES } = require('../errors');

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

/**
 * Example of function to retrieve select options from an external endpoint.
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getWorkflowGroups = async ({ featuresValues }) => {
  try {
    const response = await axios.get(
      `${featuresValues.endpoint.url}/rest/v4/repository/?deep=true`,
      getRequestConfigFromEndpointForm(featuresValues.endpoint)
    );

    if (!response) {
      return Response.error(ERRORS_MESSAGES.NO_RESPONSE_FROM_KNIME, { error: new Error(ERRORS_MESSAGES.NO_RESPONSE_FROM_KNIME) });
    }

    const { data: repository } =  response;

    if (!repository) {
      return Response.empty(ERRORS_MESSAGES.NO_WORKFLOW_GROUPS);
    }

    const workflowGroups = getWorkflowGroupsRecursive(repository);

    if (!workflowGroups || workflowGroups.length === 0) {
      return Response.empty(ERRORS_MESSAGES.NO_WORKFLOW_GROUPS);
    }

    return Response.success(workflowGroups.map((workflowGroup) => ({
      id: workflowGroup.path,
      data: workflowGroup,
      label: workflowGroup.path
    })));
  } catch (error) {
    if (error && error.response) {
      if (error.response.status === 401) {
        return Response.error(ERRORS_MESSAGES.LOGIN_ERROR, { error: new Error(`${error.response.status} - ${error.response.statusText}`) });
      }

      if (error.response.status === 404) {
        return Response.error(ERRORS_MESSAGES.RESOURCE_NOT_FOUND_ERROR, { error: new Error(`${error.response.status} - ${error.response.statusText}`) });
      }

      return Response.error(`${ERRORS_MESSAGES.WORKFLOW_GROUPS_ERROR} : ${error.response.status} - ${error.response.statusText}`, { error: new Error(`${error.response.status} - ${error.response.statusText}`) });
    }

    return Response.error(ERRORS_MESSAGES.WORKFLOW_GROUPS_ERROR, { error });
  }
};

/**
 * Example of function to retrieve select options from an external endpoint.
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getWorkflows = async ({ featuresValues }) => {
  try {
    const workflows = getWorkflowsRecursive(featuresValues.workflowGroup.data);

    if (!workflows || workflows.length === 0) {
      return Response.empty(ERRORS_MESSAGES.NO_WORKFLOWS);
    }

    return Response.success(workflows.map((workflow) => ({
      id: workflow.path,
      label: workflow.path
    })));
  } catch (error) {
    return Response.error(ERRORS_MESSAGES.WORKFLOWS, { error });
  }
};

/**
 * Example of function to retrieve select options from an external endpoint.
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getJobs = async ({ featuresValues }) => {
  try {
    const response = await axios.get(
      `${featuresValues.endpoint.url}/rest/v4/repository${featuresValues.workflow.id}:jobs`,
      getRequestConfigFromEndpointForm(featuresValues.endpoint)
    );

    const runNewJobOption = {
      id: RUN_NEW_JOB,
      label: 'Run new job for selected workflow'
    };

    if (!response) {
      return Response.error(ERRORS_MESSAGES.NO_RESPONSE_FROM_KNIME, { error: new Error(ERRORS_MESSAGES.NO_RESPONSE_FROM_KNIME) });
    }

    const { data: workflowJobs } = response;

    if (!workflowJobs) {
      return Response.success([runNewJobOption]);
    }

    const { jobs } = workflowJobs;

    if (!jobs) {
      return Response.success([runNewJobOption]);
    }

    return Response.success(
      [
        ...jobs.map((job) => ({
          id: job.id,
          label: job.name
        })),
        runNewJobOption
      ]
    );
  } catch (error) {
    if (error && error.response) {
      return Response.error(`${ERRORS_MESSAGES.WORKFLOW_JOBS_ERROR} : ${error.response.status} - ${error.response.statusText}`, { error: new Error(`${error.response.status} - ${error.response.statusText}`) });
    }

    return Response.error(ERRORS_MESSAGES.WORKFLOW_JOBS_ERROR, { error });
  }
};
