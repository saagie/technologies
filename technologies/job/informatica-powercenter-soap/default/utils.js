const soap = require('soap');
const parser = require('fast-xml-parser');

export const getMetadataWSDLUrl = (featuresValues) => `${featuresValues.endpoint.url}/services/BatchServices/Metadata?WSDL`;

export const getDataIntegrationWSDLUrl = (featuresValues) => `${featuresValues.endpoint.url}/services/BatchServices/DataIntegration?WSDL`;

export const getSessionId = async (featuresValues) => {
  console.log({ featuresValues });
  const url = getMetadataWSDLUrl(featuresValues);

  const client = await soap.createClientAsync(url);

  const resLogin = await client.loginAsync({
    RepositoryDomainName: featuresValues.endpoint.repositoryDomainName,
    RepositoryName: featuresValues.repository.label,
    UserName: featuresValues.endpoint.username,
    Password: featuresValues.endpoint.password,
  });

  if (resLogin && resLogin.length > 0 && resLogin[1]) {
    const resObj = parser.parse(resLogin[1]);
    const resBody = resObj['soapenv:Envelope']['soapenv:Body'];
    const resBodyValues = Object.values(resBody);

    return resBodyValues[0];
  }

  return null;
};
