import { JobStatus } from "@saagie/sdk";

export const JOB_STATUS = {
    'Running': JobStatus.RUNNING,
    'Succeeded': JobStatus.SUCCEEDED,
    'Failed': JobStatus.FAILED,
    'Error': JobStatus.FAILED,
    'Skipped': JobStatus.KILLED,
};
