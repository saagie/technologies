import { JobStatus } from "@saagie/sdk";

export const JOB_STATUS = {
    'ACTIVE': JobStatus.RUNNING,
    'OFFLINE': JobStatus.FAILED,
    'DEPLOY_IN_PROGRESS': JobStatus.AWAITING,
};
