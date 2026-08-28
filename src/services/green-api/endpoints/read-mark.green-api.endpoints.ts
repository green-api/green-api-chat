import { serviceMethodsGreenApiEndpoints } from 'services/green-api/endpoints/service-methods.green-api.endpoints';
import { greenAPI } from 'services/green-api/green-api.service';
import type { RootState } from 'store';
import { GetChatsParametersInterface, ReadChatParameters, ReadChatResponseInterface } from 'types';

export const readMarkGreenApiEndpoints = greenAPI.injectEndpoints({
  endpoints: (builder) => ({
    readChat: builder.mutation<ReadChatResponseInterface, ReadChatParameters>({
      query: ({ idInstance, apiTokenInstance, apiUrl, mediaUrl: _, ...body }) => ({
        url: `${apiUrl}waInstance${idInstance}/readChat/${apiTokenInstance}`,
        method: 'POST',
        body,
      }),
      onQueryStarted: async ({ idInstance, chatId }, { dispatch, getState, queryFulfilled }) => {
        const state = getState() as RootState;

        const chatsEntries = serviceMethodsGreenApiEndpoints.util
          .selectInvalidatedBy(state, ['chats'])
          .filter(
            (entry) =>
              entry.endpointName === 'getChats' &&
              (entry.originalArgs as GetChatsParametersInterface).idInstance === idInstance
          );

        const patches = chatsEntries.map(({ originalArgs }) =>
          dispatch(
            serviceMethodsGreenApiEndpoints.util.updateQueryData(
              'getChats',
              originalArgs as GetChatsParametersInterface,
              (draft) => {
                const chat = draft.find((chat) => chat.chatId === chatId);

                if (chat && chat.unreadCount) {
                  chat.unreadCount = 0;
                }
              }
            )
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patches.forEach((patch) => patch.undo());
        }
      },
    }),
  }),
});
