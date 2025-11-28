import Constants from 'expo-constants';

const ENV = {
  dev: {
    apiUrl: 'http://localhost:3000/api',
    googleClientId: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
    mapboxAccessToken: 'YOUR_MAPBOX_ACCESS_TOKEN'
  },
  prod: {
    apiUrl: 'https://your-production-api.com/api',
    googleClientId: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
    mapboxAccessToken: 'YOUR_MAPBOX_ACCESS_TOKEN'
  }
};

const getEnvVars = () => {
  const __DEV__ = process.env.NODE_ENV === 'development';
  if (__DEV__) {
    return ENV.dev;
  }
  return ENV.prod;
};

export default {
  ...getEnvVars(),
  extra: Constants.expoConfig?.extra || {}
};
