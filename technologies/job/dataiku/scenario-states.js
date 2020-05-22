const { JobStatus } = require('@saagie/sdk');

export const SCENARIO_STATES = {
  'SUCCESS': JobStatus.SUCCEEDED,
  'FAILED': JobStatus.FAILED,
  'ABORTED': JobStatus.ABORTED
};
