const { getStatus, stop, start } = require('../utils');

exports.start = ({ job }) => start(job, {
  httpDataSource: {
    listUrl: job.featuresValues.tsvFileURL,
  },
});

exports.stop = stop;

exports.getStatus = getStatus;

exports.getLogs = () => {};
