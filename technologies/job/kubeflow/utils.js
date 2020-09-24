const { Response } = require('@saagie/sdk');
const axios = require('axios');
const qs = require('qs');
const { URL } = require('url');
const http = require('http');
const https = require('https');

const login = (featuresValues, authLink) => {
  const postData = qs.stringify({
    login: featuresValues.endpoint.login,
    password: featuresValues.endpoint.password
  });

  const url = new URL(featuresValues.endpoint.instanceUrl);

  const { port, hostname, protocol } = url;

  const options = {
    hostname,
    port,
    path: authLink,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return new Promise ((resolve, reject) => {
    const httpProtocol = protocol === 'https:' ? https : http;

    let req = httpProtocol.request(options);

    req.on('response', res => {
      resolve(res);
    });
  
    req.on('error', (e) => {
      reject(e);
    });
  
    // Write data to request body
    req.write(postData);
    req.end();
  }); 
}

export const getRequest = (featuresValues, path, headers = {}) => {
  const url = new URL(featuresValues.endpoint.instanceUrl);

  const { port, hostname, protocol } = url;

  const options = {
    hostname,
    port,
    path,
    method: 'GET',
    headers,
  };

  return new Promise ((resolve, reject) => {
    const httpProtocol = protocol === 'https' ? https : http;

    let req = httpProtocol.request(options);

    req.on('response', res => {
      resolve(res);
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.end();
  }); 
}

export const getHeadersWithAccessToken = async (featuresValues) => {
  const resAuthLink = await axios.get(featuresValues.endpoint.instanceUrl);

  const authLink = resAuthLink.request.path;

  const resLogin = await login(featuresValues, authLink);

  const approvalLink = resLogin.headers.location;

  const resApproval = await getRequest(featuresValues, approvalLink);

  const oidcLink = resApproval.headers.location;

  const oidcLinkWithoutHost = oidcLink.replace(featuresValues.endpoint.instanceUrl, '');
  
  let authCookieString = null;

  const resOidc = await getRequest(featuresValues, oidcLinkWithoutHost);

  if (resOidc.headers && resOidc.headers['set-cookie']) {
    const authCookie = resOidc.headers['set-cookie'];
    authCookieString = authCookie[0];
  } else {
    const oidcLoginLink = resOidc.headers.location;
    const resOidcLogin = await getRequest(featuresValues, oidcLoginLink);
    const authCookie = resOidcLogin.headers['set-cookie'];
    authCookieString = authCookie[0];
  }

  const authCookieRes = authCookieString.substr(0, authCookieString.indexOf(';'));

  return {
    headers: { Cookie: authCookieRes }
  };
};

export const getErrorMessage = (error, mainErrorMessage) => {
  if (error && error.response) {
    if (
      error.response.data
      && error.response.data.error
      && error.response.data.error.message
    ) {
      return Response.error(`${mainErrorMessage} : ${error.response.data.error.message}`, { error: new Error(error.response.data.error.message) });
    }

    return Response.error(`${mainErrorMessage} : ${error.response.status} - ${error.response.statusText}`, { error: new Error(`${error.response.status} - ${error.response.statusText}`) });
  }

  return Response.error(mainErrorMessage, { error });
}

export const EXPERIMENT_LABEL = 'EXPERIMENT';

export const PIPELINE_VERSION_LABEL = 'PIPELINE_VERSION';
