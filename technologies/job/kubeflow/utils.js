const { Response } = require('@saagie/sdk');
const axios = require('axios');
const qs = require('qs');
const http = require('http');

const login = (featuresValues, authLink) => {
  const postData = qs.stringify({
    login: featuresValues.endpoint.login,
    password: featuresValues.endpoint.password
  });

  const options = {
    hostname: featuresValues.endpoint.instanceUrl,
    port: featuresValues.endpoint.instancePort || 80,
    path: authLink,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return new Promise ((resolve, reject) => {
    let req = http.request(options);

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
  const options = {
    hostname: featuresValues.endpoint.instanceUrl,
    port: featuresValues.endpoint.instancePort || 80,
    path,
    method: 'GET',
    headers,
  };

  return new Promise ((resolve, reject) => {
    let req = http.request(options);

    req.on('response', res => {
      resolve(res);
    });

    req.on('end', res => {
      console.log({ res });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.end();
  }); 
}

export const getHeadersWithAccessToken = async (featuresValues) => {
  const resAuthLink = await axios.get(`${featuresValues.endpoint.instanceUrl}:${featuresValues.endpoint.instancePort}`);

  const authLink = resAuthLink.request.path;

  const resLogin = await login(featuresValues, authLink);

  const approvalLink = resLogin.headers.location;

  const resApproval = await getRequest(featuresValues, approvalLink);

  const oidcLink = resApproval.headers.location;

  const oidcLinkWithoutHost = oidcLink.replace(`http://${featuresValues.endpoint.instanceUrl}:${featuresValues.endpoint.instancePort}`, '');
  const oidcLinkWithoutHost = oidcLink.replace(`https://${featuresValues.endpoint.instanceUrl}:${featuresValues.endpoint.instancePort}`, '');
  
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
