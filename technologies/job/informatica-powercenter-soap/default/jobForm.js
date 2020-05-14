const { Response } = require('@saagie/sdk');

const {
  getMetadataClient,
  getMetadataClientAuthenticated,
  getResponseBodyFromSOAPRequest,
} = require('./utils');
const { ERRORS_MESSAGES } = require('../errors');

/**
 * Example of function to retrieve select options from an external endpoint.
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getRepositories = async ({ featuresValues }) => {
  try {
    const client = await getMetadataClient(featuresValues);

    const res = await client.getAllRepositoriesAsync();

    const resBody = getResponseBodyFromSOAPRequest(res);

    if (resBody && resBody.length > 0) {
      return Response.success(
        resBody.map(({ RepositoryInfo }) => ({
          label: RepositoryInfo.Name,
        })),
      );
    }

    return Response.empty(ERRORS_MESSAGES.NO_REPOSITORIES);
  } catch (error) {
    return Response.error(ERRORS_MESSAGES.REPOSITORIES_ERROR, { error });
  }
};

/**
 * Example of function to retrieve select options from an external endpoint.
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getFolders = async ({ featuresValues }) => {
  try {
    const client = await getMetadataClientAuthenticated(featuresValues);

    const res = await client.getAllFoldersAsync();

    const resBody = getResponseBodyFromSOAPRequest(res);

    if (resBody && resBody.length > 0) {
      return Response.success(
        resBody.map(({ FolderInfo }) => ({
          label: FolderInfo.Name,
        })),
      );
    }

    return Response.empty(ERRORS_MESSAGES.NO_FOLDERS);
  } catch (error) {
    return Response.error(ERRORS_MESSAGES.FOLDERS_ERROR, { error });
  }
};

/**
 * Example of function to retrieve select options from an external endpoint.
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getWorkflows = async ({ featuresValues }) => {
  try {
    const client = await getMetadataClientAuthenticated(featuresValues);

    const res = await client.getAllWorkflowsAsync({
      Name: featuresValues.folder.label,
    });

    const resBody = getResponseBodyFromSOAPRequest(res);

    if (resBody && resBody.length > 0) {
      return Response.success(
        resBody.map(({ WorkflowInfo }) => ({
          label: WorkflowInfo.Name,
        })),
      );
    }

    return Response.empty(ERRORS_MESSAGES.NO_WORKFLOWS);
    
  } catch (error) {
    return Response.error(ERRORS_MESSAGES.WORKFLOWS_ERROR, { error });
  }
};

/**
 * Example of function to retrieve select options from an external endpoint.
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getServices = async ({ featuresValues }) => {
  try {
    const client = await getMetadataClientAuthenticated(featuresValues);

    const res = await client.getAllDIServersAsync();

    const resBody = getResponseBodyFromSOAPRequest(res);

    if (resBody && resBody.length > 0) {
      return Response.success(
        resBody.map(({ DIServerInfo }) => ({
          label: DIServerInfo.Name,
        })),
      );
    }

    return Response.empty(ERRORS_MESSAGES.NO_INTEGRATION_SERVICES);
    
  } catch (error) {
    return Response.error(ERRORS_MESSAGES.INTEGRATION_SERVICES_ERROR, { error });
  }
};

/**
 * Example of function to retrieve select options from an external endpoint.
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getTasks = async ({ featuresValues }) => {
  try {
    const client = await getMetadataClientAuthenticated(featuresValues);

    const res = await client.getAllTaskInstancesAsync({
      WorkflowInfo: {
        Name: featuresValues.workflow.label,
        FolderName: featuresValues.folder.label,
      },
      Depth: 1,
    });

    const resBody = getResponseBodyFromSOAPRequest(res);

    if (resBody && resBody.length > 0) {
      return Response.success(
        resBody.map(({ TaskInstanceInfo }) => ({
          label: TaskInstanceInfo.Name,
        })),
      );
    }

    return Response.empty(ERRORS_MESSAGES.NO_TASKS);
    
  } catch (error) {
    return Response.error(ERRORS_MESSAGES.TASKS_ERROR, { error });
  }
};
