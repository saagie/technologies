const { Response, JobStatus, Log } = require('@saagie/sdk');
const AWS = require('aws-sdk');

/**
 * Logic to start the external job instance.
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data.
 */
exports.start = async ({ job, instance }) => {
  try {
    //console.log('START INSTANCE:', instance);
    AWS.config.update({credentials: { accessKeyId : job.featuresValues.endpoint.aws_access_key_id, secretAccessKey:  job.featuresValues.endpoint.aws_secret_access_key}});
    AWS.config.update({region: job.featuresValues.endpoint.region});

    const glue = new AWS.Glue({apiVersion: '2017-03-31'});

    const data = await glue.startCrawler({ Name: job.featuresValues.crawler.id }).promise();

    console.log(data);

    // You can return any payload you want to get in the stop and getStatus functions.
    return Response.success();
  } catch (error) {
    return Response.error('Fail to start job', { error });
  }
};

/**
 * Logic to stop the external job instance.
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data including the payload returned in the start function.
 */
exports.stop = async ({ job, instance }) => {
  try {
    console.log('STOP INSTANCE:', instance);
    AWS.config.update({credentials: { accessKeyId : job.featuresValues.endpoint.aws_access_key_id, secretAccessKey:  job.featuresValues.endpoint.aws_secret_access_key}});
    AWS.config.update({region: job.featuresValues.endpoint.region});

    const glue = new AWS.Glue({apiVersion: '2017-03-31'});

    const data = await glue.stopCrawler({ Name: job.featuresValues.crawler.id }).promise();

    return Response.success();
  } catch (error) {
    return Response.error('Fail to stop job', { error });
  }
};

/**
 * Logic to retrieve the external job instance status.
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data including the payload returned in the start function.
 */
exports.getStatus = async ({ job, instance }) => {
  try {
    console.log('GET STATUS INSTANCE:', instance);
    AWS.config.update({credentials: { accessKeyId : job.featuresValues.endpoint.aws_access_key_id, secretAccessKey:  job.featuresValues.endpoint.aws_secret_access_key}});
    AWS.config.update({region: job.featuresValues.endpoint.region});

    const glue = new AWS.Glue({apiVersion: '2017-03-31'});

    const data = await glue.getCrawler({ Name: job.featuresValues.crawler.id }).promise();

    console.log(data);

    switch (data.Crawler.State) {
      case 'RUNNING':
        return Response.success(JobStatus.RUNNING);
      case 'READY':
        if (data.Crawler.LastCrawl && data.Crawler.LastCrawl.Status)
        switch(data.Crawler.LastCrawl.Status) {
          case 'SUCCEEDED':
            return Response.success(JobStatus.SUCCEEDED);
          case 'CANCELLED':
            return Response.success(JobStatus.KILLED);
          case 'FAILED':
            return Response.success(JobStatus.FAILED);
        }
      case 'STOPPING':
        return Response.success(JobStatus.KILLING);
    }
  } catch (error) {
    return Response.error(`Failed to get status for crawler ${job.featuresValues.crawler}`, { error });
  }
};

/**
 * Logic to retrieve the external job instance logs.
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data including the payload returned in the start function.
 */
exports.getLogs = async ({ job, instance }) => {
  try {
    console.log('GET LOG INSTANCE:', instance);
    AWS.config.update({credentials: { accessKeyId : job.featuresValues.endpoint.aws_access_key_id, secretAccessKey:  job.featuresValues.endpoint.aws_secret_access_key}});
    AWS.config.update({region: job.featuresValues.endpoint.region});

    const glue = new AWS.Glue({apiVersion: '2017-03-31'});

    const data = await glue.getCrawler({ Name: job.featuresValues.crawler.id }).promise();

    const cwl = new AWS.CloudWatchLogs({apiVersion: '2014-03-28'});

    const params = {
      logGroupName: '/aws-glue/crawlers',
      logStreamName:  job.featuresValues.crawler.id,
    };

    const logs = await cwl.getLogEvents(params).promise();

    return Response.success(logs.events.filter(item  => item.message.startsWith(`[${data.Crawler.LastCrawl.MessagePrefix}]`)).map((item) => Log(item.message.replace(`[${data.Crawler.LastCrawl.MessagePrefix}] `, ''), Stream.STDOUT, new Date(item.timestamp*1000).toISOString())));
  } catch (error) {
    console.log(error);
    return Response.error(`Failed to get log for crawler ${data.Crawler.LastCrawl.MessagePrefix}`, { error });
  }
};
