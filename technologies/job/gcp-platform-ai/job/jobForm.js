const { Response } = require('@saagie/sdk');
const { google } = require('googleapis');
const ml = google.ml('v1');
const { getConnexion } = require('./utils');

/**
 * Example of function to retrieve select options from an external endpoint.
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 */
exports.getJobs = async ({ featuresValues }) => {
  try {
    const gcpKey = JSON.parse(featuresValues.endpoint.jsonKey);
    //console.log(gcpKey)
    const authClient = getConnexion(gcpKey);
    const { data: { jobs } } = await ml.projects.jobs.list({
      auth: authClient,
      parent: "projects/" + gcpKey.project_id
    })
    //console.log(jobs);
    //const authClient = await auth.getClient();
    //google.options(auth, authClient);
    // Do the magic
    /* const res = await ml.projects.jobs.list({
      // Optional. Specifies the subset of jobs to retrieve.
      // You can filter on the value of one or more attributes of the job object.
      // For example, retrieve jobs with a job identifier that starts with census:
      // <code>gcloud ai-platform jobs list --filter='jobId:census<em>'</code>
      // List all failed jobs with names that start with rnn:
      // <code>gcloud ai-platform jobs list --filter='jobId:rnn</em>
      // AND state:FAILED'</code>
      // For more examples, see the guide to
      // href="/ml-engine/docs/tensorflow/monitor-training">monitoring jobs.
      filter: placeholder-value,
      // Optional. The number of jobs to retrieve per &quot;page&quot; of results. If there
      // are more remaining results than this number, the response message will
      // contain a valid value in the <code>next_page_token</code> field.
      //
      // The default value is 20, and the maximum page size is 100.
      pageSize: placeholder-value,
      // Optional. A page token to request the next page of results.
      //
      // You get the token from the <code>next_page_token</code> field of the response from
      // the previous call.
      pageToken: placeholder-value,
      // Required. The name of the project for which to list jobs.
      parent: projects/my-project,
    }); */
    

    /* 
    if (!datasets || !datasets.length) {
      return Response.empty('No datasets availables');
    }
    */
    return Response.success(
      jobs.map(({ jobId }) => ({
        id: jobId,
        label: jobId,
      })),
    );
  } catch (error) {
    return Response.error("Can't retrieve jobs", { error });
  }
};
