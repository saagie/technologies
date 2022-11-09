
export const JobStatus = {
    AWAITING: 'AWAITING',
    REQUESTED: 'REQUESTED',
    QUEUED: 'QUEUED',
    RUNNING: 'RUNNING',
    SUCCEEDED: 'SUCCEEDED',
    KILLING: 'KILLING',
    KILLED: 'KILLED',
    FAILED: 'FAILED',
};

export const StatusMapping = {
    'Created': JobStatus.QUEUED,
    'Pending': JobStatus.QUEUED,
    'InProgress': JobStatus.RUNNING,
    'Complete': JobStatus.SUCCEEDED,
    'Canceled': JobStatus.KILLED,
    'Failed': JobStatus.FAILED,
};
