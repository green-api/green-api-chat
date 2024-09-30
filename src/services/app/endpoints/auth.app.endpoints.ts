import { appAPI } from 'services/app/app.service';
import { AppApiResponse, AppMethodsEnum, UserInterface, UserLoginDataInterface } from 'types';

export const authAppApiEndpoints = appAPI.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<
      AppApiResponse<Pick<UserInterface, 'idUser' | 'apiTokenUser'>>,
      UserLoginDataInterface
    >({
      query: (body) => ({
        url: '',
        body,
        method: 'POST',
        headers: {
          'x-ga-method': AppMethodsEnum.Login,
        },
      }),
    }),
  }),
});
