const { JobStatus } = require('@saagie/sdk');

export const JOB_STATES = {
  'Preparing': JobStatus.QUEUED,
  'Queued': JobStatus.QUEUED,
  'NotStarted': JobStatus.QUEUED,
  'CancelRequested': JobStatus.KILLING,
  'Canceled': JobStatus.KILLED,
  'Running': JobStatus.RUNNING,
  'Finished': JobStatus.SUCCEEDED,
  'Completed': JobStatus.SUCCEEDED,
  'Failed': JobStatus.FAILED,
};
