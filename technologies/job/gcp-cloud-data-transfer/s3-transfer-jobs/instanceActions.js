const { getStatus, stop, start } = require('../utils');

exports.start = ({ job }) => start(job, {
  awsS3DataSource: {
    bucketName: job.featuresValues.S3bucketName,
    awsAccessKey: {
      accessKeyId: job.featuresValues.accessKeyID,
      secretAccessKey: job.featuresValues.secretKeyID
    },
  },
});

exports.stop = stop;

exports.getStatus = getStatus;

exports.getLogs = () => {};
