const { JobStatus } = require('@saagie/sdk');

export const JOB_STATES = {
  'NOT_STARTED': JobStatus.QUEUED,
  'RUNNING': JobStatus.RUNNING,
  'FAILED': JobStatus.FAILED,
  'ABORTED': JobStatus.KILLED,
  'DONE': JobStatus.SUCCEEDED
};
