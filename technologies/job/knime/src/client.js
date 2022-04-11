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
    console.log('Response', response.status, response.statusText, ":", response.data);
}

export const buildClient = (connection) => {
    const client = axios.create({
        adapter: axiosHttp,
    });

    const requestAuthHttp = (method, query, data, config) =>
        requestHttp(client, method, `${connection.url}/${query}`, data, {}, {
            ...config,
            auth: {
                username: connection.username,
                password: connection.password
            }
        });

    return {
        getJobs: (workflow) => requestAuthHttp('GET', `/rest/v4/repository${workflow}:jobs`),
        getRepository: () => requestAuthHttp('GET', 'rest/v4/repository/?deep=true'),
        createJob: (workflow) => requestAuthHttp('POST', `rest/v4/repository${workflow}:jobs`),
        runJob: (jobId) => requestAuthHttp('POST', `rest/v4/jobs/${jobId}`),
        getJob: (jobId) => requestAuthHttp('GET', `rest/v4/jobs/${jobId}`),
        getLogs: () => requestAuthHttp('GET', 'rest/v4/admin/logs', null, {responseType: 'arraybuffer'}),
    };
}
