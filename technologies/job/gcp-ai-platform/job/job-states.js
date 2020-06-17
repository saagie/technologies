import { JobStatus } from "@saagie/sdk";

export const JOB_STATUS = {
    'QUEUED': JobStatus.QUEUED,
    'PREPARING': JobStatus.QUEUED,
    'RUNNING': JobStatus.RUNNING,
    'SUCCEEDED': JobStatus.SUCCEEDED,
    'FAILED': JobStatus.FAILED,
    'CANCELLING': JobStatus.KILLING,
    'CANCELLED': JobStatus.KILLED
};
