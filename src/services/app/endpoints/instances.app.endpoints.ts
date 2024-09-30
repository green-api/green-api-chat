import { appAPI } from 'services/app/app.service';
import { AppMethodsEnum, GetInstancesResponse } from 'types';
import { isNewInstance } from 'utils';

export const instancesAppApiEndpoints = appAPI.injectEndpoints({
  endpoints: (builder) => ({
    getInstances: builder.query<GetInstancesResponse, void>({
      query: () => ({
        url: '',
        method: 'POST',
        headers: {
          'x-ga-method': AppMethodsEnum.GetInstances,
        },
      }),
      transformResponse: (response: GetInstancesResponse) => {
        if (!response?.result) return response;

        response.data = response.data.map((instance) => {
          if (isNewInstance(instance.timeCreated)) return { ...instance, isExpired: false };

          return instance;
        });

        return response;
      },
    }),
  }),
});
