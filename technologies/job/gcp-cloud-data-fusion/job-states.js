import { JobStatus } from "@saagie/sdk";

export const JOB_STATUS = {
    'KILLED': JobStatus.KILLED,
    'FAILED': JobStatus.FAILED,
    'COMPLETED': JobStatus.SUCCEEDED,
    'RUNNING': JobStatus.RUNNING,
    'PROVISIONNING': JobStatus.RUNNING,
};
