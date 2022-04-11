import * as axios from 'axios';
import axiosHttp from 'axios/lib/adapters/http';

const AZURE_MANAGEMENT_API_URL = 'https://management.azure.com';
const AZURE_INSIGHTS_API_URL = 'https://api.applicationinsights.io';
const AZURE_MANAGEMENT_CORE_API_URL = 'https://management.core.windows.net/';
const AZURE_DATABRICKS_API_ID = '2ff814a6-3304-4ab8-85cb-cd0e6f879c1d';

const loginToAzureResource = async (endpoint, resourceUrl) => {
    const {
        clientId,
        clientSecret,
        tenantId,
    } = endpoint;

    const loginRequestBody = {
        'grant_type': 'client_credentials',
        'client_id': clientId,
        'client_secret': clientSecret,
        resource: resourceUrl,
    };

    const config = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }

    const { data } = await axios.post(
        `https://login.microsoftonline.com/${tenantId}/oauth2/token`,
        qs.stringify(loginRequestBody),
        config
    );

    const { access_token: accessToken } = data;

    return accessToken;
};

const getHeadersWithAccessTokenForManagementResource = async (endpoint) => {
    const accessToken = await loginToAzureResource(endpoint, AZURE_MANAGEMENT_API_URL);

    return {
        headers: { Authorization: `Bearer ${accessToken}` }
    };
};

const getAccessTokenForManagementCoreResource = async (endpoint) => {
    const accessToken = await loginToAzureResource(endpoint, AZURE_MANAGEMENT_CORE_API_URL);

    return accessToken;
};

export const getHeadersWithAccessTokenForDatabricksResource = async (featuresValues) => {
    const accessToken = await loginToAzureResource(featuresValues.endpoint, AZURE_DATABRICKS_API_ID);

    return {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'X-Databricks-Azure-Workspace-Resource-Id': featuresValues.workspace.id,
            'X-Databricks-Azure-SP-Management-Token': await getAccessTokenForManagementCoreResource(featuresValues.endpoint)
        }
    };
};

const requestHttp = async (client, method, url, data, headers, config) => {
    console.log('Requesting', method, 'at', url, data ? 'with data' : '', data ?? '', headers ? 'with headers' : '', headers ?? '');
    let response;
    try {
        response = await client.request({method, url, data, ...config});
    } catch (e) {
        console.log('HTTP error:', e.response?.status, e.response?.statusText, e.response?.data);
        throw e;
    }
    console.log('Response', response.status, response.statusText, ":", response.data);
}

export const buildClient = async (connection) => {
    const client = axios.create({adapter: axiosHttp});

    const requestManagementHttp = (method, query, data) =>
        requestHttp(client, method, `${AZURE_MANAGEMENT_API_URL}/${query}`, data); // TODO add management auth

    const requestDatabricksHttp = (method, url, data, params) =>
        requestHttp(client, method, url, data, null, {params}); // TODO add databricks auth

    const discoverUrls = (discoveryUrl) => requestHttp(client, 'GET', discoveryUrl);

    const requestExperimentsHttp = async (discoveryUrl, method, path, data, headers) =>
        requestHttp(client, method, `${(await discoverUrls(discoveryUrl).data.experimentation)}/${path}`, data, headers); // TODO add management auth

    const requestRegionalHttp = async (discoveryUrl, method, path, data, headers) =>
        requestHttp(client, method, `${(await discoverUrls(discoveryUrl).data.api)}/${path}`, data, headers); // TODO add management auth

    const requestInsightsHttp = async (method, path, data) =>
        requestHttp(client, method, `${AZURE_INSIGHTS_API_URL}/v1/apps/${connection.insightsAppId}/events/${path}`, data); // TODO add insight auth

    return {
        databricks: {
            listWorkspace: (workspaceUrl, params) =>
                requestDatabricksHttp('GET', `https://${workspaceUrl}/api/2.0/workspace/list`, null, params),
            getWorkspaceJobs: (workspaceUrl) =>
                requestDatabricksHttp('GET', `https://${workspaceUrl}/api/2.0/jobs/list`),
            createJob: (workspaceUrl, data) =>
                requestDatabricksHttp('POST', `https://${workspaceUrl}/api/2.0/jobs/create`, data),
            runJob: (workspaceUrl, jobId) =>
                requestDatabricksHttp('POST', `https://${workspaceUrl}/api/2.0/jobs/run-now`, {job_id: jobId}),
            cancelJob: (workspaceUrl, runId) =>
                requestDatabricksHttp('POST', `https://${workspaceUrl}/api/2.0/jobs/runs/cancel`, {run_id: runId}),
            getRunJob: (workspaceUrl, runId) =>
                requestDatabricksHttp('GET', `https://${workspaceUrl}/api/2.0/jobs/runs/get?run_id=${runId}`),
            getCluster: (workspaceUrl, clusterId) =>
                requestDatabricksHttp('GET', `https://${workspaceUrl}/api/2.0/clusters/get?cluster_id=${clusterId}`),
            getClusterLogs: (workspaceUrl, logsDestination, clusterId) =>
                requestDatabricksHttp('GET', `https://${workspaceUrl}/api/2.0/dbfs/read?path=${logsDestination}/${clusterId}/driver/stdout`),
        },
        experiments: {
            getExperiments: (discoveryUrl, resourceGroup, workspace) =>
                requestExperimentsHttp(discoveryUrl, 'GET', `/history/v1.0/subscriptions/${connection.subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.MachineLearningServices/workspaces/${workspace}/experiments`),
            getDatasets: (discoveryUrl, resourceGroup, workspace) =>
                requestExperimentsHttp(discoveryUrl, 'GET', `/dataset/v1.0/subscriptions/${connection.subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.MachineLearningServices/workspaces/${workspace}/datasets`),
            getDatasetColumns: (discoveryUrl, resourceGroup, workspace, datasetSavedId) =>
                requestExperimentsHttp(discoveryUrl, 'GET', `/dataset/v1.0/subscriptions/${connection.subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.MachineLearningServices/workspaces/${workspace}/saveddatasets/${datasetSavedId}/tieredpreview`),
            runExperiment: (discoveryUrl, resourceGroup, workspace, experiment, data) =>
                requestExperimentsHttp(discoveryUrl, 'POST', `/jasmine/v1.0/subscriptions/${connection.subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.MachineLearningServices/workspaces/${workspace}/experiment/${experiment}/run`, data),
            startSnapshotRun: (discoveryUrl, resourceGroup, workspace, experiment, runId, jsonDefinition) => {
                const formData = new FormData();
                formData.append('json_definition', JSON.stringify(jsonDefinition));
                return requestExperimentsHttp(discoveryUrl, 'POST', `/jasmine/v1.0/subscriptions/${connection.subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.MachineLearningServices/workspaces/${workspace}/experiment/${experiment}/runs/${runId}/startSnapshotRun`, formData, formData.getHeaders())
            },
            getRunDetails: (discoveryUrl, resourceGroup, workspace, experiment, runId) =>
                requestExperimentsHttp(discoveryUrl, 'GET', `/history/v1.0/subscriptions/${connection.subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.MachineLearningServices/workspaces/${workspace}/experimentids/${experiment}/runs/${runId}/details`),
            getRunSetupDetails: (discoveryUrl, resourceGroup, workspace, experiment, runId) =>
                requestExperimentsHttp(discoveryUrl, 'GET', `/history/v1.0/subscriptions/${connection.subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.MachineLearningServices/workspaces/${workspace}/experimentids/${experiment}/runs/${runId}_setup/details`),
        },
        insights: {
            getRequests: () => requestInsightsHttp('GET', 'requests'),
            getTraces: () => requestInsightsHttp('GET', 'traces'),
        },
        management: {
            getComputes: (resourceGroup, workspace) =>
                requestManagementHttp('GET', `/subscriptions/${connection.subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.MachineLearningServices/workspaces/${workspace}/computes?api-version=2020-04-01`),
            createRunPipeline: (resourceGroup, factory, pipeline) =>
                requestManagementHttp('POST', `${resourceGroup}/providers/Microsoft.DataFactory/factories/${factory}/pipelines/${pipeline}/createRun?api-version=2018-06-01`),
            reRunPipeline: (resourceGroup, factory, pipeline, runId) =>
                requestManagementHttp('POST', `${resourceGroup}/providers/Microsoft.DataFactory/factories/${factory}/pipelines/${pipeline}/createRun?referencePipelineRunId=${runId}&isRecovery=true&api-version=2018-06-01`),
            cancelRunPipeline: (resourceGroup, factory, runId) =>
                requestManagementHttp('POST', `${resourceGroup}/providers/Microsoft.DataFactory/factories/${factory}/pipelineruns/${runId}/cancel?api-version=2018-06-01`),
            getRunPipeline: (resourceGroup, factory, runId) =>
                requestManagementHttp('GET', `${resourceGroup}/providers/Microsoft.DataFactory/factories/${factory}/pipelineruns/${runId}?api-version=2018-06-01`),
            getResourceGroups: () =>
                requestManagementHttp('GET', `subscriptions/${connection.subscriptionId}/resourcegroups?api-version=2019-10-01`),
            getFactories: (resourceGroup) =>
                requestManagementHttp('GET', `${resourceGroup}/providers/Microsoft.DataFactory/factories?api-version=2018-06-01`),
            getPipelines: (resourceGroup, factory) =>
                requestManagementHttp('GET', `${resourceGroup}/providers/Microsoft.DataFactory/factories/${factory}/pipelines?api-version=2018-06-01`),
            getPipelineRuns: (resourceGroup, factory, data) =>
                requestManagementHttp('GET', `${resourceGroup}/providers/Microsoft.DataFactory/factories/${factory}/queryPipelineRuns?api-version=2018-06-01`, data),
            getWorkspaces: (resourceGroup) =>
                requestManagementHttp('GET', `${resourceGroup}/providers/Microsoft.Databricks/workspaces?api-version=2018-04-01`),
            getFunctionApps: (resourceGroup) =>
                requestManagementHttp('GET', `${resourceGroup}/providers/Microsoft.Web/sites?api-version=2019-08-01`),
            getFunctions: (functionApp) =>
                requestManagementHttp('GET', `${functionApp}/functions?api-version=2019-08-01`),
            editFunctionState: (functionId, data) =>
                requestManagementHttp('PUT', `${functionId}/properties/state?api-version=2018-11-01`, data),
            getFunction: (functionId) =>
                requestManagementHttp('GET', `${functionId}?api-version=2019-08-01`),
        },
        regional: {
            getMLPipelineRuns: (discoveryUrl, resourceGroup, workspace) =>
                requestRegionalHttp(discoveryUrl, 'GET', `/studioservice/api/subscriptions/${connection.subscriptionId}/resourceGroups/${resourceGroup}/workspaces/${workspace}/pipelineruns`),
            cancelRun: (discoveryUrl, resourceGroup, workspace, experiment, runId) =>
                requestRegionalHttp(discoveryUrl, 'POST', `/jasmine/v1.0/subscriptions/${connection.subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.MachineLearningServices/workspaces/${workspace}/experiment/${experiment}/cancel/${runId}`),
            startRun: (discoveryUrl, resourceGroup, workspace, experiment, projectZipFile, runDefinitionFile) => {
                const formData = new FormData();
                formData.append('projectZipFile', projectZipFile, 'train.zip');
                formData.append('runDefinitionFile', runDefinitionFile, 'runDefinition.json');
                return requestRegionalHttp(discoveryUrl, 'POST', `/execution/v1.0/subscriptions/${connection.subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.MachineLearningServices/workspaces/${workspace}/experiments/${experiment}/startrun?api-version=2019-11-01`, formData, formData.getHeaders());
            },
            // TODO how is this different from the other 'cancelRun' ?
            cancelExecutionRun: (discoveryUrl, resourceGroup, workspace, experiment, runId) =>
                requestRegionalHttp(discoveryUrl, 'POST', `/execution/v1.0/subscriptions/${connection.subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.MachineLearningServices/workspaces/${workspace}/experiments/${experiment}/runId/${runId}/cancel`),
            rerunMLPipeline: (discoveryUrl, resourceGroup, workspace, runId, data) =>
                requestRegionalHttp(discoveryUrl, 'POST', `/studioservice/api/subscriptions/${connection.subscriptionId}/resourceGroups/${resourceGroup}/workspaces/${workspace}/pipelineruns/${runId}/rerun`, data),
            cancelMLPipelineRun: (discoveryUrl, resourceGroup, workspace, runId) =>
                requestRegionalHttp(discoveryUrl, 'POST', `/pipelines/v1.0/subscriptions/${connection.subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.MachineLearningServices/workspaces/${workspace}/pipelineruns/${runId}/cancel`),
        },
        get: (url) => requestHttp(client, 'GET', url),
    };
};
