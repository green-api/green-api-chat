import { greenAPI } from 'services/green-api/green-api.service';
import { GetGroupDataResponseInterface, GroupBaseParametersInterface } from 'types';

export const groupGreenApiEndpoints = greenAPI.injectEndpoints({
  endpoints: (builder) => ({
    getGroupData: builder.query<GetGroupDataResponseInterface, GroupBaseParametersInterface>({
      query: ({ idInstance, apiTokenInstance, apiUrl, mediaUrl: _, ...body }) => ({
        url: `${apiUrl}waInstance${idInstance}/getGroupData/${apiTokenInstance}`,
        method: 'POST',
        body,
      }),
      keepUnusedDataFor: 1000,
    }),
  }),
});
