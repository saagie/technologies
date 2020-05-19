const { JobStatus } = require('@saagie/sdk');

export const JOB_EXECUTION_STATES = {
  'RUNNING': JobStatus.RUNNING,
  'INITIALIZED': JobStatus.QUEUED,
  'STOPPING': JobStatus.KILLING,
  'FAILED': JobStatus.FAILED
};

export const JOB_STATES = {
  1: JobStatus.SUCCEEDED,
  2: JobStatus.FAILED,
  3: JobStatus.FAILED,
};
