export const getRequestConfigFromEndpointForm = (endpointForm) => (
  {
    auth: {
      username: endpointForm.username,
      password: endpointForm.password
    }
  }
);
