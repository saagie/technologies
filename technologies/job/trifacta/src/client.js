import axios from 'axios';
import axiosHttp from 'axios/lib/adapters/http';
import https from 'https';
// import AdmZip from 'adm-zip'; // TODO is requires 'fs'...
import zlib from 'zlib';

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

export const buildClient = (connection) => {
    const client = axios.create({
        adapter: axiosHttp,
    });

    const baseConfig = {
        httpsAgent: (connection.ignoreSslIssues ? new https.Agent({rejectUnauthorized: false}) : null)
    };
    if (connection.email && connection.password) {
        baseConfig.auth = {
            username: connection.email,
            password: connection.password
        };
    } else if (connection.access_token) {
        baseConfig.headers = {
            'Authorization': `Bearer ${connection.access_token}`
        };
    }

    const requestAuthHttp = async (method, query, data, config) =>
        requestHttp(client, method, `${connection.url}/${query}`, data, {}, {...baseConfig, ...config});

    return {
        cancelJobGroup: (jobGroupId) => requestAuthHttp('POST', `v4/jobGroups/${jobGroupId}/cancel`),
        createJobGroups: (data) => requestAuthHttp('POST', 'v4/jobGroups', data),
        createOutputObject: (data) => requestAuthHttp('POST', '/v4/outputObjects', data),
        createPlan: (plan) => requestAuthHttp(connection, 'POST', `v4/plans/${plan}/run`),
        getFlows: () => requestAuthHttp(connection, 'GET', '/v4/flows'),
        getJobGroupLogs: (jobGroupId) => requestAuthHttp(connection, 'GET', `v4/jobGroups/${jobGroupId}/logs`, {responseType: 'arraybuffer'}),
        getJobGroupStatus: (jobGroupId) => requestAuthHttp(connection, 'GET', `v4/jobGroups/${jobGroupId}/status`),
        getOutputObjects: () => requestAuthHttp('GET', 'v4/outputObjects'),
        getPlanDetails: (planId) => requestAuthHttp(connection, 'GET', `v4/plans/${planId}/full?ensureOriginal=false`),
        getPlans: () => requestAuthHttp(connection, 'GET', 'v4/plans'),
        getPlanSnapshotRuns: (planSnapshotRunId) => requestAuthHttp(connection, 'GET', `v4/planSnapshotRuns/${planSnapshotRunId}`),
        getWrangledDatasets: () => requestAuthHttp(connection, 'GET', 'v4/wrangledDatasets'),
        updateOutputObject: (id, data) => requestAuthHttp('PUT', `/v4/outputObjects/${id}`, data),
    };
}

export const extractLogs = async (data) => {
    const unzip = zlib.createUnzip()
    data.pipe(unzip)
    const zip = new AdmZip(data);
    const zipEntries = zip.getEntries();

    let logsLines = [];

    zipEntries.forEach((zipEntry) => {
        if (zipEntry && zipEntry.entryName.includes('job.log')) {

            const fileData = zipEntry.getData();

            const logsContent = fileData.toString('utf8');

            logsLines = logsLines.concat(logsContent.split('\n'));
        }
    });

    return logsLines;
}
