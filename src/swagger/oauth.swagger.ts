export const loginWithGithubRoute = {
  '/oauth/github': {
    get: {
      tags: ['Oauth'],
      summary: 'GitHub OAuth login',
      description:
        'Redirects the user to GitHub for OAuth authentication. **Note**: Swagger UI cannot follow this redirect. Use a browser to test.',
    },
    responses: {
      302: {
        description: 'Redirect to GitHub login',
      },
    },
  },
};
export const loginWithGoogleRoute = {
  '/oauth/google': {
    get: {
      tags: ['Oauth'],
      summary: 'Google OAuth login',
      description:
        'Redirects the user to Google for OAuth authentication. **Note**: Swagger UI cannot follow this redirect. Use a browser to test.',
    },
    responses: {
      302: {
        description: 'Redirect to Google login',
      },
    },
  },
};
