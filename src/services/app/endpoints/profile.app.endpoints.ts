import { appAPI } from 'services/app/app.service';
import { AppApiResponse, AppMethodsEnum, GetProfileSettingsResponse } from 'types';

export const profileAppApiEndpoints = appAPI.injectEndpoints({
  endpoints: (builder) => ({
    getProfileSettings: builder.query<AppApiResponse<GetProfileSettingsResponse>, void>({
      query: () => ({
        url: '',
        method: 'POST',
        headers: {
          'x-ga-method': AppMethodsEnum.GetProfileSettings,
        },
      }),
      providesTags: ['profileSettings'],
    }),
  }),
});
