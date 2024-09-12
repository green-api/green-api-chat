import { greenAPI } from 'services/green-api/green-api.service';
import { GetStateInstanceResponseInterface, InstanceInterface } from 'types';
import { getGreenApiUrls } from 'utils';

export const accountGreenApiEndpoints = greenAPI.injectEndpoints({
  endpoints: (builder) => ({
    getStateInstance: builder.query<GetStateInstanceResponseInterface, InstanceInterface>({
      query: ({ idInstance, apiTokenInstance }) => ({
        url: `${
          getGreenApiUrls(idInstance).api
        }/waInstance${idInstance}/getStateInstance/${apiTokenInstance}`,
      }),
    }),
  }),
});
