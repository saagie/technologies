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

    const requestAuthHttp = async (method, query, data) =>
        requestHttp(client, method, `${connection.url}/nifi-api/${query}`, data);

    return {
        getProcessGroups: () => requestAuthHttp('GET', 'process-groups/root/'),
        startProcessGroup: (groupId) => requestAuthHttp('PUT', `flow/process-groups/${groupId}`, {
            "id": groupId,
            "state": "RUNNING",
            "disconnectedNodeAcknowledged": false
        }),
        stopProcessGroup: (groupId) => requestAuthHttp('PUT', `flow/process-groups/${groupId}`, {
            "id": groupId,
            "state": "STOPPED",
            "disconnectedNodeAcknowledged": false
        }),
        getProcessGroupStatus: (groupId) => requestAuthHttp('GET', `flow/process-groups/${groupId}/status`),
        getBulletinBoard: (groupId) => requestAuthHttp('GET', `flow/bulletin-board?groupId=${groupId}`),
    };
}
