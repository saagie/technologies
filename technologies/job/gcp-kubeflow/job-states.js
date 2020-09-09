import { JobStatus } from "@saagie/sdk";

export const RUN_STATUS = {
    RUNNING: 'Running',
    SUCCEEDED: 'Succeeded',
    FAILED: 'Failed',
    ERROR: 'Error',
    SKIPPED: 'Skipped',
}

export const JOB_STATUS = {
    [RUN_STATUS.RUNNING]: JobStatus.RUNNING,
    [RUN_STATUS.SUCCEEDED]: JobStatus.SUCCEEDED,
    [RUN_STATUS.FAILED]: JobStatus.FAILED,
    [RUN_STATUS.ERROR]: JobStatus.FAILED,
    [RUN_STATUS.SKIPPED]: JobStatus.KILLED,
};
