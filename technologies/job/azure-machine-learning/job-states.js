const { JobStatus } = require('@saagie/sdk');

export const JOB_STATES = {
  'Queued': JobStatus.QUEUED,
  'NotStarted': JobStatus.QUEUED,
  'CancelRequested': JobStatus.KILLING,
  'Canceled': JobStatus.KILLED,
  'Preparing': JobStatus.RUNNING,
  'Running': JobStatus.RUNNING,
  'Starting': JobStatus.RUNNING,
  'Finished': JobStatus.SUCCEEDED,
  'Completed': JobStatus.SUCCEEDED,
  'Failed': JobStatus.FAILED,
};
