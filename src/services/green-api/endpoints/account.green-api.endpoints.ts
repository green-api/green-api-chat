import { greenAPI } from 'services/green-api/green-api.service';
import {
  GetStateInstanceResponseInterface,
  GetWaSettingsResponseInterface,
  InstanceInterface,
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
    }),
    getAccountSettings: builder.query<
      GetWaSettingsResponseInterface,
      InstanceInterface & { rtkWaSettingsSessionKey?: number }
    >({
      query: ({ idInstance, apiTokenInstance, apiUrl }) => ({
        url: `${apiUrl}waInstance${idInstance}/getAccountSettings/${apiTokenInstance}`,
      }),
      keepUnusedDataFor: 1000,
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
  }),
});
