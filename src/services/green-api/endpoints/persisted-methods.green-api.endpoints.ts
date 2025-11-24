import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import {
  GetAvatarResponseInterface,
  GetGroupDataResponseInterface,
  GroupBaseParametersInterface,
  RequestWithChatIdParameters,
} from 'types';
import { isHydrateAction } from 'utils/hydrate';

export const persistedMethods = createApi({
  reducerPath: 'groupPersistentAPI',
  baseQuery: fetchBaseQuery({ baseUrl: '/' }),

  extractRehydrationInfo(action, { reducerPath }): any {
    if (isHydrateAction(action)) {
      if (action.key === reducerPath) {
        return action.payload;
      }

      return action.payload?.[persistedMethods.reducerPath] ?? undefined;
    }
  },
  tagTypes: ['groupData', 'avatar'],

  endpoints: (builder) => ({
    getGroupData: builder.query<GetGroupDataResponseInterface, GroupBaseParametersInterface>({
      query: ({ idInstance, apiTokenInstance, apiUrl, mediaUrl: _, ...body }) => ({
        url: `${apiUrl}waInstance${idInstance}/getGroupData/${apiTokenInstance}`,
        method: 'POST',
        body,
      }),
      providesTags: (result, error, { groupId, chatId }) => [
        { type: 'groupData', id: chatId ?? groupId },
      ],
    }),
    getAvatar: builder.query<GetAvatarResponseInterface, RequestWithChatIdParameters>({
      query: ({ idInstance, apiTokenInstance, apiUrl, mediaUrl: _, ...body }) => ({
        url: `${apiUrl}waInstance${idInstance}/getAvatar/${apiTokenInstance}`,
        method: 'POST',
        body,
      }),
      providesTags: (result, error, { chatId }) => [{ type: 'avatar', id: chatId }],
    }),
  }),
});
