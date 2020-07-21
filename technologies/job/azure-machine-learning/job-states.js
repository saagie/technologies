const { JobStatus } = require('@saagie/sdk');

export const JOB_STATES = {
  'NotStarted': JobStatus.QUEUED,
  'Canceled': JobStatus.KILLED,
  'Running': JobStatus.RUNNING,
  'Finished': JobStatus.SUCCEEDED,
  'Failed': JobStatus.FAILED,
};
