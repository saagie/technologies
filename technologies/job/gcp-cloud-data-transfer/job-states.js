import { JobStatus } from "@saagie/sdk";

export const JOB_STATUS = {
    'IN_PROGRESS': JobStatus.RUNNING,
    'PAUSED': JobStatus.KILLED,
    'SUCCESS': JobStatus.SUCCEEDED,
    'FAILED': JobStatus.FAILED,
    'ABORTED': JobStatus.KILLED
};
