const { JobStatus } = require('@saagie/sdk');

export const JOB_STATES = {
  'Queued': JobStatus.QUEUED,
  'Canceling': JobStatus.KILLING,
  'Cancelled': JobStatus.KILLED,
  'InProgress': JobStatus.RUNNING,
  'Succeeded': JobStatus.SUCCEEDED,
  'Failed': JobStatus.FAILED,
};
