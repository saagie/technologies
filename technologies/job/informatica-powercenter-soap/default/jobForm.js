const { Response } = require('@saagie/sdk');
const soap = require('soap');
const parser = require('fast-xml-parser');

const { getSessionId, getMetadataWSDLUrl } = require('./utils');

/**
 * Example of function to retrieve select options from an external endpoint.
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getRepositories = async ({ featuresValues }) => {
  try {
    const url = getMetadataWSDLUrl(featuresValues);

    console.log({ url });

    const client = await soap.createClientAsync(url);

    const res = await client.getAllRepositoriesAsync();

    if (res && res.length > 0 && res[1]) {
      const resObj = parser.parse(res[1]);
      const resBody = resObj['soapenv:Envelope']['soapenv:Body'];
      const resBodyValues = Object.values(resBody);

      return Response.success(
        resBodyValues.map(({ RepositoryInfo }) => ({
          label: RepositoryInfo.Name,
        })),
      );
    }

    return Response.empty("No repositories");
    
  } catch (error) {
    return Response.error("Can't retrieve repositories", { error });
  }
};

/**
 * Example of function to retrieve select options from an external endpoint.
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getFolders = async ({ featuresValues }) => {
  try {
    const url = getMetadataWSDLUrl(featuresValues);

    const client = await soap.createClientAsync(url);

    const sessionId = await getSessionId(featuresValues);

    client.addSoapHeader({
      'ns0:Context': {
        attributes: { 'xmlns:ns0': 'http://www.informatica.com/wsh' },
        SessionId: sessionId
      }
    });

    const res = await client.getAllFoldersAsync();

    if (res && res.length > 0 && res[1]) {
      const resObj = parser.parse(res[1]);
      const resBody = resObj['soapenv:Envelope']['soapenv:Body'];
      const resBodyValues = Object.values(resBody);

      return Response.success(
        resBodyValues.map(({ FolderInfo }) => ({
          label: FolderInfo.Name,
        })),
      );
    }

    return Response.empty("No folders");
    
  } catch (error) {
    return Response.error("Can't retrieve folders", { error });
  }
};

/**
 * Example of function to retrieve select options from an external endpoint.
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getWorkflows = async ({ featuresValues }) => {
  try {
    const url = getMetadataWSDLUrl(featuresValues);

    const client = await soap.createClientAsync(url);

    const sessionId = await getSessionId(featuresValues);

    client.addSoapHeader({
      'ns0:Context': {
        attributes: { 'xmlns:ns0': 'http://www.informatica.com/wsh' },
        SessionId: sessionId
      }
    });

    const res = await client.getAllWorkflowsAsync({
      Name: featuresValues.folder.label,
    });

    if (res && res.length > 0 && res[1]) {
      const resObj = parser.parse(res[1]);
      const resBody = resObj['soapenv:Envelope']['soapenv:Body'];
      const resBodyValues = Object.values(resBody);

      return Response.success(
        resBodyValues.map(({ WorkflowInfo }) => ({
          label: WorkflowInfo.Name,
        })),
      );
    }

    return Response.empty("No workflows");
    
  } catch (error) {
    return Response.error("Can't retrieve workflows", { error });
  }
};

/**
 * Example of function to retrieve select options from an external endpoint.
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getServices = async ({ featuresValues }) => {
  try {
    const url = getMetadataWSDLUrl(featuresValues);

    const client = await soap.createClientAsync(url);

    const sessionId = await getSessionId(featuresValues);

    client.addSoapHeader({
      'ns0:Context': {
        attributes: { 'xmlns:ns0': 'http://www.informatica.com/wsh' },
        SessionId: sessionId
      }
    });

    const res = await client.getAllDIServersAsync();

    if (res && res.length > 0 && res[1]) {
      const resObj = parser.parse(res[1]);
      const resBody = resObj['soapenv:Envelope']['soapenv:Body'];
      const resBodyValues = Object.values(resBody);

      return Response.success(
        resBodyValues.map(({ DIServerInfo }) => ({
          label: DIServerInfo.Name,
        })),
      );
    }

    return Response.empty("No integration services");
    
  } catch (error) {
    return Response.error("Can't retrieve inegration services", { error });
  }
};
