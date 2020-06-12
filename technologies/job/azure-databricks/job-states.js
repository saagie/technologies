const { JobStatus } = require('@saagie/sdk');

export const JOB_STATES = {
  'PENDING': JobStatus.QUEUED,
  'SKIPPED': JobStatus.KILLED,
  'CANCELED': JobStatus.KILLED,
  'RUNNING': JobStatus.RUNNING,
  'SUCCESS': JobStatus.SUCCEEDED,
  'TIMEDOUT': JobStatus.FAILED,
  'FAILED': JobStatus.FAILED,
};
