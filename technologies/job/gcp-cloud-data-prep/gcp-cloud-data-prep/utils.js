export const getRequestConfigFromEndpointForm = (endpointForm) => (
  {
    headers: {
      'Authorization': `Bearer ${endpointForm.access_token}`
    }
  }
);