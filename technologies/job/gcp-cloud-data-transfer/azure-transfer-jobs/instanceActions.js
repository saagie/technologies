const { getStatus, stop, start } = require('../utils');

exports.start = ({ job }) => start(job, {
  azureBlobStorageDataSource: {
    container: job.featuresValues.containerName,
    storageAccount: job.featuresValues.storageAccountName,
    azureCredentials: {
      sasToken: job.featuresValues.sapToken
    },
  }
});

exports.stop = stop;

exports.getStatus = getStatus;

exports.getLogs = () => {};
