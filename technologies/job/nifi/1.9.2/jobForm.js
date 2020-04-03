const axios = require('axios');
const { Response } = require('@saagie/sdk');

exports.getProcessGroups = async ({ featuresValues }) => {
  try {
    const { data: processgroups } = await axios.get(
      `${featuresValues.endpoint.url}/nifi-api/process-groups/root/`,
    );

    if (!processgroups || !processgroups.status) {
      return Response.empty('No process groups availables');
    }

    return Response.success(
      ([{
        id: processgroups.status.id,
        label: processgroups.status.name,
      }]),
    );
  } catch (error) {
    return Response.error("Can't retrieve process groups", { error });
  }
};
