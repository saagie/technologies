export const ERRORS_MESSAGES = {
  NO_RESPONSE_FROM_DATAIKU: 'No response from Dataiku',
  NO_PROJECTS: 'No projects availables',
  NO_DATASETS: 'No tasks availables',
  NO_SCENARIOS: 'No scenarios availables',
  PROJECTS_ERROR: 'Can\'t retrieve projects',
  DATASETS_ERROR: 'Can\'t retrieve datasets',
  SCENARIOS_ERROR: 'Can\'t retrieve scenarios',
  LOGIN_ERROR: 'Login error, please check your API key in Endpoint form',
  FAILED_TO_RUN_JOB_ERROR: 'Failed to run job from Dataiku',
  FAILED_TO_STOP_JOB_ERROR: 'Failed to stop job from Dataiku',
  FAILED_TO_GET_JOB_STATUS_ERROR: 'Failed to get status for job from Dataiku',
  FAILED_TO_GET_JOB_LOGS_ERROR: 'Failed to get logs for job from Dataiku',
  FAILED_TO_RUN_SCENARIO_ERROR: 'Failed to run job from Dataiku',
  FAILED_TO_STOP_SCENARIO_ERROR: 'Failed to stop job from Dataiku',
  FAILED_TO_GET_SCENARIO_STATUS_ERROR: 'Failed to get status for job from Dataiku'
};

const NOT_AUTHENTICATED_EXCEPTION = 'com.dataiku.dip.exceptions.NotAuthenticatedException';

export const hasLoginError = (error) => (
  error
  && error.response
  && error.response.status === 401
  && error.response.data
  && error.response.data.errorType
  && error.response.data.errorType === NOT_AUTHENTICATED_EXCEPTION
);
