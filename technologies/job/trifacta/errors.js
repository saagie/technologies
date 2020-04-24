export const ERRORS_MESSAGES = {
  NO_RESPONSE_FROM_TRIFACTA: 'No response from Trifacta',
  NO_FLOWS: 'No flows availables',
  NO_DATASETS: 'No datasets availables',
  NO_DATASETS_FOR_SELECTED_FLOW: 'No datasets availables for this flow',
  SSL_ERROR: 'SSL error, you can disable SSL issues in Endpoint form',
  LOGIN_ERROR: 'Login error, please check your credentials in Endpoint form',
  RESOURCE_NOT_FOUND_ERROR: 'Resource not found, please check your endpoint URL in Endpoint form',
  FLOWS_ERROR: 'Can\'t retrieve flows from Trifacta',
  DATASETS_ERROR: 'Can\'t retrieve wrangled datasets from Trifacta',
  PARSING_WRITE_SETTINGS_ERROR: 'Error while parsing write settings',
  MISSING_RUN_ENV_ERROR: 'Failed to start job from Trifacta, missing running environment informations',
  MISSING_RUN_ENV_FULL_ERROR: 'Failed to start job from Trifacta : if it\'s the first time that a job is run for the selected wrangled dataset, please complete job execution, profiler and write settings fields',
  FAILED_TO_RUN_JOB_ERROR: 'Failed to start job from Trifacta',
  FAILED_TO_GET_STATUS_ERROR: 'Failed to get status for job from Trifacta',
  FAILED_TO_GET_LOGS_ERROR: 'Failed to get logs for job from Trifacta'
}

export const VALIDATION_FIELD = 'ValidationFailed';
export const SSL_ISSUES_CODE = 'UNABLE_TO_VERIFY_LEAF_SIGNATURE';
