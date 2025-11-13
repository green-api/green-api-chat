import { greenAPI } from 'services/green-api/green-api.service';
import {
  CheckWhatsappParametersInterface,
  GetQRResponseInterface,
  GetStateInstanceResponseInterface,
  GetWaSettingsResponseInterface,
  InstanceInterface,
  LogoutResponseInterface,
  SendMaxAuthCodeParametersInterface,
  StartAuthorizationResponseInterface,
} from 'types';

export const accountGreenApiEndpoints = greenAPI.injectEndpoints({
  endpoints: (builder) => ({
    getWaSettings: builder.query<
      GetWaSettingsResponseInterface,
      InstanceInterface & { rtkWaSettingsSessionKey?: number }
    >({
      query: ({ idInstance, apiTokenInstance, apiUrl }) => ({
        url: `${apiUrl}waInstance${idInstance}/getWaSettings/${apiTokenInstance}`,
      }),
      keepUnusedDataFor: 1000,
      providesTags: (result, _, arguments_) => {
        if (result) return [{ type: 'waSettings', id: arguments_.idInstance }, 'lastMessages'];
        return [{ type: 'waSettings', id: 'waAccountSettings' }, 'lastMessages'];
      },
    }),
    getAccountSettings: builder.query<
      GetWaSettingsResponseInterface,
      InstanceInterface & { rtkWaSettingsSessionKey?: number }
    >({
      query: ({ idInstance, apiTokenInstance, apiUrl }) => ({
        url: `${apiUrl}waInstance${idInstance}/getAccountSettings/${apiTokenInstance}`,
      }),
      keepUnusedDataFor: 1000,
      providesTags: (result, _, arguments_) => {
        if (result) return [{ type: 'waSettings', id: arguments_.idInstance }, 'lastMessages'];
        return [{ type: 'waSettings', id: 'waAccountSettings' }, 'lastMessages'];
      },
    }),
    getStateInstance: builder.query<GetStateInstanceResponseInterface, InstanceInterface>({
      query: ({ idInstance, apiTokenInstance, apiUrl }) => ({
        url: `${apiUrl}waInstance${idInstance}/getStateInstance/${apiTokenInstance}`,
      }),
    }),
    getAuthorizationCode: builder.mutation<
      GetQRResponseInterface,
      CheckWhatsappParametersInterface
    >({
      query: ({ idInstance, apiTokenInstance, apiUrl, mediaUrl: _, ...body }) => ({
        url: `${apiUrl}waInstance${idInstance}/getAuthorizationCode/${apiTokenInstance}`,
        method: 'POST',
        body,
      }),
    }),
    logout: builder.mutation<LogoutResponseInterface, InstanceInterface>({
      query: ({ idInstance, apiTokenInstance, apiUrl }) => ({
        url: `${apiUrl}waInstance${idInstance}/logout/${apiTokenInstance}`,
      }),
      invalidatesTags: (_, __, arguments_) => {
        return [{ type: 'waSettings', id: arguments_.idInstance }];
      },
    }),
    startAuthorization: builder.mutation<
      StartAuthorizationResponseInterface,
      CheckWhatsappParametersInterface
    >({
      query: ({ idInstance, apiTokenInstance, apiUrl, mediaUrl: _, ...body }) => ({
        url: `${apiUrl}waInstance${idInstance}/startAuthorization/${apiTokenInstance}`,
        method: 'POST',
        body,
      }),
    }),
    sendAuthorizationCode: builder.mutation<
      StartAuthorizationResponseInterface,
      SendMaxAuthCodeParametersInterface
    >({
      query: ({ idInstance, apiTokenInstance, apiUrl, mediaUrl: _, ...body }) => ({
        url: `${apiUrl}waInstance${idInstance}/sendAuthorizationCode/${apiTokenInstance}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_, __, arguments_) => {
        return [{ type: 'waSettings', id: arguments_.idInstance }];
      },
    }),
  }),
});
