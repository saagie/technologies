const axios = require('axios');
const fs = require('fs');
const { Response } = require('@saagie/sdk');

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
    const { data: repository } = await axios.get(
      `${featuresValues.endpoint.url}/rest/v4/repository/?deep=true`,
      {
        auth: {
          username: featuresValues.endpoint.username,
          password: featuresValues.endpoint.password
        }
      }
    );

    const workflowGroups = getWorkflowGroupsRecursive(repository);

    return Response.success(workflowGroups.map((workflowGroup) => ({
      id: workflowGroup.path,
      data: workflowGroup,
      label: workflowGroup.path
    })));
  } catch (error) {
    console.log({ error });
    return Response.error("Can't retrieve datasets", { error });
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

    return Response.success(workflows.map((workflow) => ({
      id: workflow.path,
      label: workflow.path
    })));
  } catch (error) {
    console.log({ error });
    return Response.error("Can't retrieve datasets", { error });
  }
};

/**
 * Example of function to retrieve select options from an external endpoint.
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getJobs = async ({ featuresValues }) => {
  try {
    const { data: workflowJobs } = await axios.get(
      `${featuresValues.endpoint.url}/rest/v4/repository${featuresValues.workflow.id}:jobs`,
      {
        auth: {
          username: featuresValues.endpoint.username,
          password: featuresValues.endpoint.password
        }
      }
    );

    const { jobs } = workflowJobs;

    return Response.success(jobs.map((job) => ({
      id: job.id,
      label: job.name
    })));
  } catch (error) {
    console.log({ error });
    return Response.error("Can't retrieve datasets", { error });
  }
};
