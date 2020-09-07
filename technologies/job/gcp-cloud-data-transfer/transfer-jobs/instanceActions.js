const { getStatus, stop, start } = require('../utils');

exports.start = ({ job }) => start(job, {
  gcsDataSource: {
    bucketName: job.featuresValues.sourceBucket.id,
  },
});

exports.stop = stop;

exports.getStatus = getStatus;

exports.getLogs = () => {};

