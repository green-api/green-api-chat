import { appAPI } from 'services/app/app.service';
import { AppApiResponse, AppMethodsEnum, GetProfileSettingsResponse, UserInterface } from 'types';

export const profileAppApiEndpoints = appAPI.injectEndpoints({
  endpoints: (builder) => ({
    getProfileSettings: builder.query<
      AppApiResponse<GetProfileSettingsResponse>,
      Omit<UserInterface, 'login'>
    >({
      query: ({ idUser, apiTokenUser }) => ({
        url: '',
        method: 'POST',
        headers: {
          'x-ga-method': AppMethodsEnum.GetProfileSettings,
          'x-ga-user-id': idUser,
          'x-ga-user-token': apiTokenUser,
        },
      }),
      providesTags: ['profileSettings'],
    }),
  }),
});
