import { JobStatus } from "@saagie/sdk";

export const JOB_STATUS = {
    'JOB_STATE_STOPPED': JobStatus.KILLED,
    'JOB_STATE_RUNNING': JobStatus.RUNNING,
    'JOB_STATE_DONE': JobStatus.SUCCEEDED,
    'JOB_STATE_FAILED': JobStatus.FAILED,
    'JOB_STATE_CANCELLED': JobStatus.KILLED,
    'JOB_STATE_UPDATED': JobStatus.KILLED,
    'JOB_STATE_DRAINING': JobStatus.KILLING,
    'JOB_STATE_DRAINED': JobStatus.KILLED,
    'JOB_STATE_PENDING': JobStatus.QUEUED,
    'JOB_STATE_CANCELLING': JobStatus.KILLING,
    'JOB_STATE_QUEUED': JobStatus.QUEUED,
    'JOB_STATE_UNKNOWN': JobStatus.AWAITING,
};
