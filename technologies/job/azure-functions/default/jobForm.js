const axios = require('axios');
const { Response } = require('@saagie/sdk');
const { getHeadersWithAccessTokenForManagementResource } = require('../utils');

/**
 * Example of function to retrieve select options from an external endpoint.
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getResourceGroups = async ({ featuresValues }) => {
  try {
    const { subscriptionId } = featuresValues.endpoint;

    const resourceGroupsDataRes = await axios.get(
      `https://management.azure.com/subscriptions/${subscriptionId}/resourcegroups?api-version=2019-10-01`,
      await getHeadersWithAccessTokenForManagementResource(featuresValues.endpoint)
    );

    if (
      resourceGroupsDataRes
      && resourceGroupsDataRes.data
      && resourceGroupsDataRes.data.value
      && resourceGroupsDataRes.data.value.length > 0
    ) {
      return Response.success(resourceGroupsDataRes.data.value.map(({ id, name }) => ({
        id,
        label: name
      })));
    }

    return Response.success([]);
  } catch (error) {
    return Response.error("Can't retrieve resource groups", { error });
  }
};

/**
 * Example of function to retrieve select options from an external endpoint.
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getFunctionApps = async ({ featuresValues }) => {
  try {
    const webAppsDataRes = await axios.get(
      `https://management.azure.com${featuresValues.resourceGroup.id}/providers/Microsoft.Web/sites?api-version=2019-08-01`,
      await getHeadersWithAccessTokenForManagementResource(featuresValues.endpoint)
    );

    if (
      webAppsDataRes
      && webAppsDataRes.data
      && webAppsDataRes.data.value
      && webAppsDataRes.data.value.length > 0
    ) {
      const functionApps = webAppsDataRes.data.value.filter(
        (webApp) => webApp.kind === 'functionapp'
      );

      return Response.success(functionApps.map(({ id, name }) => ({
        id,
        label: name
      })));
    }

    return Response.success([]);
  } catch (error) {
    console.log({ error });
    return Response.error("Can't retrieve function apps", { error });
  }
};

/**
 * Example of function to retrieve select options from an external endpoint.
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getFunctions = async ({ featuresValues }) => {
  try {
    const functionsDataRes = await axios.get(
      `https://management.azure.com${featuresValues.functionApp.id}/functions?api-version=2019-08-01`,
      await getHeadersWithAccessTokenForManagementResource(featuresValues.endpoint)
    );

    if (
      functionsDataRes
      && functionsDataRes.data
      && functionsDataRes.data.value
      && functionsDataRes.data.value.length > 0
    ) {
      return Response.success(functionsDataRes.data.value.map(({ id, name, properties }) => ({
        id,
        label: name,
        functionName: properties.name,
        triggerUrl: properties.invoke_url_template
      })));
    }

    return Response.success([]);
  } catch (error) {
    console.log({ error });
    return Response.error("Can't retrieve function apps", { error });
  }
};
