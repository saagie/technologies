const { JobStatus } = require('@saagie/sdk');

export const JOB_STATES = {
  ABORTED: JobStatus.KILED,
  ABORTING: JobStatus.KILLING,
  FAILED: JobStatus.FAILED,
  PREPARING_TO_RUN: JobStatus.QUEUED,
  RUNNING: JobStatus.RUNNING,
  SCHEDULED: JobStatus.QUEUED,
  STOPPED: JobStatus.KILLED,
  STOPPING: JobStatus.KILLING,
  SUCCEEDED: JobStatus.SUCCEEDED,
  SUSPENDED: JobStatus.KILLED,
  SUSPENDING: JobStatus.KILLING,
  TERMINATED: JobStatus.KILLED,
  UNSCHEDULED: JobStatus.KILLED,
  WAITING: JobStatus.QUEUED
};
