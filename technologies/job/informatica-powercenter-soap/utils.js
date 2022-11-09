const soap = require('soap');
const parser = require('fast-xml-parser');

const getMetadataWSDLUrl = (featuresValues) => `${featuresValues.endpoint.url}/services/BatchServices/Metadata?WSDL`;

const getDataIntegrationWSDLUrl = (featuresValues) => `${featuresValues.endpoint.url}/services/BatchServices/DataIntegration?WSDL`;

const getSessionIdContextHeader = (sessionId) => ({
  'ns0:Context': {
    attributes: { 'xmlns:ns0': 'http://www.informatica.com/wsh' },
    SessionId: sessionId
  }
});

export const getResponseBodyFromSOAPRequest = (res) => {
  if (res && res.length > 0 && res[1]) {
    const resObj = parser.parse(res[1]);
    const resBody = resObj['soapenv:Envelope']['soapenv:Body'];
    const resBodyValues = Object.values(resBody);

    return resBodyValues;
  }
  return null;
};

export const getSessionId = async (featuresValues) => {
  const url = getMetadataWSDLUrl(featuresValues);

  const client = await soap.createClientAsync(url);

  const resLogin = await client.loginAsync({
    RepositoryDomainName: featuresValues.endpoint.repositoryDomainName,
    RepositoryName: featuresValues.repository.label,
    UserName: featuresValues.endpoint.username,
    Password: featuresValues.endpoint.password,
  });

  const resBody = getResponseBodyFromSOAPRequest(resLogin);

  if (resBody && resBody.length > 0 && resBody[0]) {
    return resBody[0];
  }

  return null;
};

export const getMetadataClient = async (featuresValues) => {
  const url = getMetadataWSDLUrl(featuresValues);

  const client = await soap.createClientAsync(url);
  
  return client;
};

export const getMetadataClientAuthenticated = async (featuresValues) => {
  const url = getMetadataWSDLUrl(featuresValues);

  const client = await soap.createClientAsync(url);

  const sessionId = await getSessionId(featuresValues);

  client.addSoapHeader(getSessionIdContextHeader(sessionId));
  
  return client;
};

export const getDataIntegrationClientAuthenticated = async (featuresValues) => {
  const url = getDataIntegrationWSDLUrl(featuresValues);

  const client = await soap.createClientAsync(url);

  const sessionId = await getSessionId(featuresValues);

  client.addSoapHeader(getSessionIdContextHeader(sessionId));
  
  return client;
};
