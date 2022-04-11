import qs from 'qs';
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

const getAuthHeaders = async (client, connection) => {
    const {protocol, host} = new URL(connection.instanceUrl);

    const resAuthLink = await client.get(connection.instanceUrl);
    const authLink = resAuthLink.request.path;

    const resLogin = await client.request({
        url: `${protocol}//${host}/${authLink}`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: qs.stringify({
            login: connection.login,
            password: connection.password
        }),
    });
    const approvalLink = resLogin.headers.location;

    const resApproval = await client.request({
        url: `${protocol}//${host}/${approvalLink}`,
        method: 'GET'
    });
    const oidcLink = resApproval.headers.location;
    const oidcLinkWithoutHost = oidcLink.replace(connection.instanceUrl, '');

    const resOidc = await client.request({
        url: `${protocol}//${host}/${oidcLinkWithoutHost}`,
        method: 'GET'
    });

    let authCookieString;
    if (resOidc.headers && resOidc.headers['set-cookie']) {
        const authCookie = resOidc.headers['set-cookie'];
        authCookieString = authCookie[0];
    } else {
        const oidcLoginLink = resOidc.headers.location;
        const resOidcLogin = await client.request({
            url: `${protocol}//${host}/${oidcLoginLink}`,
            method: 'GET'
        });
        const authCookie = resOidcLogin.headers['set-cookie'];
        authCookieString = authCookie[0];
    }

    const authCookieRes = authCookieString.substring(0, authCookieString.indexOf(';'));

    return {
        Cookie: authCookieRes
    };
};

export const buildClient = async (connection) => {
    const client = axios.create({
        adapter: axiosHttp,
    });

    const authHeaders = await getAuthHeaders(connection);

    const requestAuthHttp = (method, query, data, config) =>
        requestHttp(client, method, `${connection.instanceUrl}/${query}`, data, authHeaders, config);

    return {
        createRun: (data) => requestAuthHttp('POST', 'pipeline/apis/v1beta1/runs', data),
        terminateRun: (runId) => requestAuthHttp('POST', `pipeline/apis/v1beta1/runs/${runId}/terminate`),
        getRun: (runId) => requestAuthHttp('GET', `/pipeline/apis/v1beta1/runs/${runId}`),
        getPodLogs: (podName) =>requestAuthHttp('GET', `k8s/pod/logs?podname=${podName}`),
        getPipelines: () => requestAuthHttp('GET', 'pipeline/apis/v1beta1/pipelines'),
        getPipelineVersions: (pipelineId) => requestAuthHttp('GET',`pipeline/apis/v1beta1/pipeline_versions?resource_key.type=PIPELINE&resource_key.id=${pipelineId}`),
        getExperiments:() => requestAuthHttp('GET', 'pipeline/apis/v1beta1/experiments'),
        getRuns:() => requestAuthHttp('GET', 'pipeline/apis/v1beta1/runs'),
        retryRun: (runId) =>requestAuthHttp('POST', `pipeline/apis/v1beta1/runs/${runId}/retry`),
    };
}
