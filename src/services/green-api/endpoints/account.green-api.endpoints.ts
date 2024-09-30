import { greenAPI } from 'services/green-api/green-api.service';
import {
  GetStateInstanceResponseInterface,
  GetWaSettingsResponseInterface,
  InstanceInterface,
} from 'types';
import { getGreenApiUrls } from 'utils';

export const accountGreenApiEndpoints = greenAPI.injectEndpoints({
  endpoints: (builder) => ({
    getWaSettings: builder.query<
      GetWaSettingsResponseInterface,
      InstanceInterface & { rtkWaSettingsSessionKey?: number }
    >({
      query: ({ idInstance, apiTokenInstance }) => ({
        url: `${
          getGreenApiUrls(idInstance).api
        }/waInstance${idInstance}/getWaSettings/${apiTokenInstance}`,
      }),
      keepUnusedDataFor: 1000,
    }),
    getStateInstance: builder.query<GetStateInstanceResponseInterface, InstanceInterface>({
      query: ({ idInstance, apiTokenInstance }) => ({
        url: `${
          getGreenApiUrls(idInstance).api
        }/waInstance${idInstance}/getStateInstance/${apiTokenInstance}`,
      }),
    }),
  }),
});
