import { JobStatus } from "@saagie/sdk";

export const CONDITION_STATUS = {
    'True': JobStatus.SUCCEEDED,
    'False': JobStatus.FAILED,
    'Unknown': JobStatus.AWAITING,
};
