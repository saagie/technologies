export const getRequestConfigFromEndpointForm = (endpointForm) => (
  {
    auth: {
      username: endpointForm.username,
      password: endpointForm.password
    }
  }
);

export const RUN_NEW_JOB = 'run-new-job';
