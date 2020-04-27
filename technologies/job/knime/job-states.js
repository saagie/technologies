const { JobStatus } = require('@saagie/sdk');

export const JOB_STATES = {
  'UNDEFINED': JobStatus.AWAITING,
  'CONFIGURED': JobStatus.QUEUED,
  'IDLE': JobStatus.FAILED,
  'DISCARDED': JobStatus.FAILED,
  'EXECUTING': JobStatus.RUNNING,
  'EXECUTED': JobStatus.SUCCEEDED,
};
