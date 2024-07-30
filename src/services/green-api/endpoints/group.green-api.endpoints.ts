import { greenAPI } from 'services/green-api/green-api.service';
import { GetGroupDataResponseInterface, GroupBaseParametersInterface } from 'types';
import { getGreenApiUrls } from 'utils';

export const groupGreenApiEndpoints = greenAPI.injectEndpoints({
  endpoints: (builder) => ({
    getGroupData: builder.query<GetGroupDataResponseInterface, GroupBaseParametersInterface>({
      query: ({ idInstance, apiTokenInstance, ...body }) => ({
        url: `${
          getGreenApiUrls(idInstance).api
        }/waInstance${idInstance}/getGroupData/${apiTokenInstance}`,
        method: 'POST',
        body,
      }),
    }),
  }),
});
