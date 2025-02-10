import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { APP_API_TOKEN, APP_API_URL, Routes } from 'configs';
import { RootState } from 'store';
import { AppApiResponse, AppMethodsEnum } from 'types';
import { deleteCookie, isPageInIframe } from 'utils';

let ignoreNotAuthorizedError = false;

export const appAPI = createApi({
  reducerPath: 'appApi',
  baseQuery: fetchBaseQuery({
    baseUrl: APP_API_URL,
    prepareHeaders: (headers, { getState }) => {
      headers.set('Authorization', `Bearer ${APP_API_TOKEN}`);

      const rootState = getState() as RootState;

      headers.set('x-ga-user-id', rootState.userReducer.user.idUser);
      headers.set('x-ga-user-token', rootState.userReducer.user.apiTokenUser);

      const method = headers.get('x-ga-method');

      ignoreNotAuthorizedError =
        method === AppMethodsEnum.Login || method === AppMethodsEnum.Verify;

      return headers;
    },
    responseHandler: async (response) => {
      const result: AppApiResponse<unknown> = await response.json();

      if (!result.result && result.error.code === 401 && !ignoreNotAuthorizedError) {
        deleteCookie('login');
        deleteCookie('idUser');
        deleteCookie('apiTokenUser');

        localStorage.removeItem('login');
        localStorage.removeItem('apiTokenUser');
        localStorage.removeItem('idUser');

        sessionStorage.clear();

        if (!isPageInIframe()) {
          document.location.href = Routes.auth;
        }
      }

      return result;
    },
  }),
  tagTypes: [
    'instances',
    'settings',
    'profileSettings',
    'orders',
    'tariffs',
    'balance',
    'payments',
    'companies',
  ],
  endpoints: () => ({}),
});
