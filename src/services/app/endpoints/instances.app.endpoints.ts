import { appAPI } from 'services/app/app.service';
import { AppMethodsEnum, GetInstancesResponse, UserInterface } from 'types';
import { isNewInstance } from 'utils';

export const instancesAppApiEndpoints = appAPI.injectEndpoints({
  endpoints: (builder) => ({
    getInstances: builder.query<GetInstancesResponse, Omit<UserInterface, 'login'>>({
      query: ({ idUser, apiTokenUser, projectId }) => ({
        url: '',
        method: 'POST',
        headers: {
          'x-ga-method': AppMethodsEnum.GetInstances,
          'x-ga-user-id': idUser,
          'x-ga-user-token': apiTokenUser,
            'x-ga-project-id': projectId,
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
