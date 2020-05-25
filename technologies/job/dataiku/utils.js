export const getAuthHeaders = (featuresValues) => (
  {
    auth: {
      username: featuresValues.endpoint.apiKey,
    }
  }
);

