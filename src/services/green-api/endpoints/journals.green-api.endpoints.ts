import { greenAPI } from 'services/green-api/green-api.service';
import {
  GetChatHistoryParametersInterface,
  GetChatHistoryResponse,
  GetChatInformationParameters,
  LastMessagesParametersInterface,
  MessageInterface,
} from 'types';
import { getGreenApiUrls } from 'utils';

export const journalsGreenApiEndpoints = greenAPI.injectEndpoints({
  endpoints: (builder) => ({
    getChatHistory: builder.query<GetChatHistoryResponse, GetChatHistoryParametersInterface>({
      query: ({ idInstance, apiTokenInstance, ...body }) => ({
        url: `${
          getGreenApiUrls(idInstance).api
        }/waInstance${idInstance}/getChatHistory/${apiTokenInstance}`,
        method: 'POST',
        body,
      }),
      transformResponse: (res: GetChatHistoryResponse) =>
        res.filter((msg) => msg.typeMessage !== 'reactionMessage').reverse(),
      merge: (currentCache, newItems) => {
        if (currentCache.length === newItems.length) {
          return currentCache;
        }

        const newMsgs = newItems.slice(currentCache.length, newItems.length);

        currentCache.push(...newMsgs);
      },
      keepUnusedDataFor: 5,
    }),
    getMessage: builder.mutation<MessageInterface, GetChatInformationParameters>({
      query: ({ idInstance, apiTokenInstance, ...body }) => ({
        url: `${
          getGreenApiUrls(idInstance).api
        }/waInstance${idInstance}/getMessage/${apiTokenInstance}`,
        method: 'POST',
        body,
      }),
    }),
    lastIncomingMessages: builder.query<GetChatHistoryResponse, LastMessagesParametersInterface>({
      query: ({ idInstance, apiTokenInstance, minutes }) => ({
        url: `${
          getGreenApiUrls(idInstance).api
        }/waInstance${idInstance}/lastIncomingMessages/${apiTokenInstance}`,
        method: 'GET',
        params: {
          minutes,
        },
      }),
    }),
    lastOutgoingMessages: builder.query<GetChatHistoryResponse, LastMessagesParametersInterface>({
      query: ({ idInstance, apiTokenInstance, minutes }) => ({
        url: `${
          getGreenApiUrls(idInstance).api
        }/waInstance${idInstance}/lastOutgoingMessages/${apiTokenInstance}`,
        method: 'GET',
        params: {
          minutes,
        },
      }),
    }),
    lastMessages: builder.query<GetChatHistoryResponse, LastMessagesParametersInterface>({
      query: ({ idInstance, apiTokenInstance }) => ({
        url: '',
        params: {
          idInstance,
          apiTokenInstance,
        },
      }),
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName;
      },
      providesTags: ['lastMessages'],
    }),
  }),
});
