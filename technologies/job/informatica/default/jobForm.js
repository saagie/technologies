const axios = require('axios');
const { Response } = require('@saagie/sdk');

/**
 * Example of function to retrieve select options from an external endpoint.
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getProjects = async ({ featuresValues }) => {
  try {
    const { data: userData } = await axios.post(
      `${featuresValues.endpoint.url}/ma/api/v2/user/login`,
      {
        username: featuresValues.endpoint.username,
        password: featuresValues.endpoint.password,
      }
    );

    if (userData && userData.icSessionId && userData.serverUrl) {
      const result = await axios.get(
        `${userData.serverUrl}/public/core/v3/objects?q=type=='Project'`,
        { headers: { 'INFA-SESSION-ID': userData.icSessionId } }
      );

      const { data } = result;

      const { objects: projects } = data;

      if (!projects || !projects.length) {
        return Response.empty('No projects availables');
      }
  
      return Response.success(
        projects.map(({ path, id }) => ({
          id,
          path,
          label: path,
        })),
      );
    }

    return Response.error('Error while login');
  } catch (error) {
    return Response.error("Can't retrieve projects", { error });
  }
};
