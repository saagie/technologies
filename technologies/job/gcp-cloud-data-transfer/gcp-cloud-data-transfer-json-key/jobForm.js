const axios = require('axios');
const { Response } = require('@saagie/sdk');
const { JWT } = require('google-auth-library');

const { google } = require('googleapis');
const { Storage } = require('@google-cloud/storage');

/**
 * Example of function to retrieve select options from an external endpoint.
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getDatasets = async ({ featuresValues }) => {
  res = this.connect({ featuresValues: featuresValues });
  if (res.err)
    return res;
};

exports.connect = async ({ featuresValues }) => {
  try {
    // console.log("JSON Key: ", featuresValues.endpoint.jsonKey);
    // console.log("Project Name: ", featuresValues.endpoint.projectName);
    const gcpKey = JSON.parse(featuresValues.endpoint.jsonKey);

    const client = new JWT({
      email: gcpKey.client_email,
      key: gcpKey.private_key,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });

    const url = `https://dns.googleapis.com/dns/v1/projects/${gcpKey.project_id}`;
    const res = await client.request({ url });

    console.log('Success! DNS Info:');
    console.log(res.data);

    return Response.error('Success! DNS Info:' + res.data, { res });
  } catch (error) {
    // dumpError(error);
    console.log('\nMessage: ' + error.message)
    return Response.error("Error:" + error.message, { error });
  }

  function dumpError(err) {
    if (typeof err === 'object') {
      if (err.message) {
        console.log('\nMessage: ' + err.message)
      }
      if (err.stack) {
        console.log('\nStacktrace:')
        console.log('====================')
        console.log(err.stack);
      }
    } else {
      console.log('dumpError :: argument is not an object');
    }
  }
}

exports.getJobList = async ({ featuresValues }) => {
  try {
    const gcpKey = JSON.parse(featuresValues.endpoint.jsonKey);

    authClient = new google.auth.JWT({
      email: gcpKey.client_email,
      key: gcpKey.private_key,
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });

    filter = { project_id: gcpKey.project_id };
    filterString = JSON.stringify(filter);

    const request = {
      auth: authClient,
      filter: filterString
    };

    // Instantiate a storagetransfer client
    const storagetransfer = google.storagetransfer('v1');

    var array = [];
    let response;
    do {
      if (response && response.nextPageToken) {
        request.pageToken = response.nextPageToken;
      }
      response = (await storagetransfer.transferJobs.list(request)).data;
      const transferJobsPage = response.transferJobs;

      console.log('transferJobsPage:');
      console.log(transferJobsPage);

      if (transferJobsPage) {
        if (array.length == 0) // It's currently empty
          array = transferJobsPage.map((job) => ({ id: job.name, label: job.description + ' - ' + job.status }));
        else
          array.concat(transferJobsPage.map((job) => ({ id: job.name, label: job.description + ' - ' + job.status })));
      }
    } while (response.nextPageToken);

    if (array.length == 0) {
      return Response.empty('No job found');
    } else {
      return Response.success(array);
    }
  } catch (error) {
    console.log(error);
    return Response.error("Can't retrieve job list", { error });
  }
};