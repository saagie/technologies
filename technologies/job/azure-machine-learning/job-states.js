const { JobStatus } = require('@saagie/sdk');

export const JOB_STATES = {
  'NotStarted': JobStatus.QUEUED,
  'CancelRequested': JobStatus.KILLING,
  'Canceled': JobStatus.KILLED,
  'Running': JobStatus.RUNNING,
  'Finished': JobStatus.SUCCEEDED,
  'Completed': JobStatus.SUCCEEDED,
  'Failed': JobStatus.FAILED,
};
