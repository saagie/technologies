const { JobStatus } = require('@saagie/sdk');

export const STATUS = {
  'Created': JobStatus.QUEUED,
  'Pending': JobStatus.QUEUED,
  'InProgress': JobStatus.RUNNING,
  'Complete': JobStatus.SUCCEEDED,
  'Canceled': JobStatus.KILLED,
  'Failed': JobStatus.FAILED,
};
