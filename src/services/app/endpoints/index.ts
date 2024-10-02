import { authAppApiEndpoints } from './auth.app.endpoints';
import { instancesAppApiEndpoints } from './instances.app.endpoints';

export const { useLoginMutation, useGetInstancesQuery } = {
  ...authAppApiEndpoints,
  ...instancesAppApiEndpoints,
};
