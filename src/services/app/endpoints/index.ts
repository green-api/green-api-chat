import { authAppApiEndpoints } from './auth.app.endpoints';
import { instancesAppApiEndpoints } from './instances.app.endpoints';
import { profileAppApiEndpoints } from './profile.app.endpoints';

export const { useLoginMutation, useGetInstancesQuery, useGetProfileSettingsQuery } = {
  ...authAppApiEndpoints,
  ...instancesAppApiEndpoints,
  ...profileAppApiEndpoints,
};
