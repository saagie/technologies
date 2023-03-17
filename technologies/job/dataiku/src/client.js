import axios from 'axios';
import axiosHttp from 'axios/lib/adapters/http';

const requestHttp = async (client, method, url, data, headers, config) => {
    console.log('Requesting', method, 'at', url, data ? 'with data' : '', data ?? '', headers ? 'with headers' : '', headers ?? '');
    let response;
    try {
        response = await client.request({method, url, data, ...config});
    } catch (e) {
        console.log('HTTP error:', e.response?.status, e.response?.statusText, e.response?.data);
        throw e;
    }
    console.log('Response Status', response.status, response.statusText);
    console.log('Response Headers', response.headers);
    console.log('Response Data', response.data);
    return response;
}

export const buildClient = (connection) => {
    const client = axios.create({
        adapter: axiosHttp,
    });

    const requestAuthHttp = (method, query, data) =>
        requestHttp(client, method, `${connection.url}/public/api/${query}`, data, null, {
            auth: {
                username: connection.apiKey,
            }
        });

    client.abortJob = (project, jobId) => requestAuthHttp('POST', `projects/${project}/jobs/${jobId}/abort/`);
    client.abortScenario = (project, scenarioId) => requestAuthHttp('POST', `projects/${project}/scenarios/${scenarioId}/abort/`);
    client.createJob = (project, o) => requestAuthHttp('POST', `projects/${project}/jobs/`, o);
    client.getDatasets = (project) => requestAuthHttp('GET', `projects/${project}/datasets/`);
    client.getJob = (project, jobId) => requestAuthHttp('GET', `projects/${project}/jobs/${jobId}/`);
    client.getJobLog = (project, jobId) => requestAuthHttp('GET', `projects/${project}/jobs/${jobId}/log/`);
    client.getLightScenario = (project, scenarioId) => requestAuthHttp('GET', `projects/${project}/scenarios/${scenarioId}/light/`);
    client.getProjects = () => requestAuthHttp('GET', 'projects/');
    client.getScenarioRunForTrigger = (project, scenarioId, triggerId, triggerRunId) => requestAuthHttp('GET', `projects/${project}/scenarios/${scenarioId}/get-run-for-trigger/?triggerId=${triggerId}&triggerRunId=${triggerRunId}`);
    client.getScenarios = (project) => requestAuthHttp('GET', `projects/${project}/scenarios/`);
    client.runScenario = (project, scenarioId) => requestAuthHttp('POST', `projects/${project}/scenarios/${scenarioId}/run/`);

    return client;
}
