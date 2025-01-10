import { greenAPI } from 'services/green-api/green-api.service';
import {
  GetChatHistoryParametersInterface,
  GetChatHistoryResponse,
  LastMessagesParametersInterface,
} from 'types';

export const journalsGreenApiEndpoints = greenAPI.injectEndpoints({
  endpoints: (builder) => ({
    getChatHistory: builder.query<GetChatHistoryResponse, GetChatHistoryParametersInterface>({
      query: ({ idInstance, apiTokenInstance, apiUrl, mediaUrl: _, ...body }) => ({
        url: `${apiUrl}waInstance${idInstance}/getChatHistory/${apiTokenInstance}`,
        method: 'POST',
        body,
      }),
      transformResponse: (res: GetChatHistoryResponse) =>
        res
          .filter(
            (msg) =>
              msg.typeMessage !== 'reactionMessage' &&
              msg.typeMessage !== 'deletedMessage' &&
              msg.typeMessage !== 'editedMessage'
          )
          .reverse(),
    }),
    lastIncomingMessages: builder.query<GetChatHistoryResponse, LastMessagesParametersInterface>({
      query: ({ idInstance, apiTokenInstance, apiUrl, minutes }) => ({
        url: `${apiUrl}waInstance${idInstance}/lastIncomingMessages/${apiTokenInstance}`,
        method: 'GET',
        params: {
          minutes,
        },
      }),
    }),
    lastOutgoingMessages: builder.query<GetChatHistoryResponse, LastMessagesParametersInterface>({
      query: ({ idInstance, apiTokenInstance, apiUrl, minutes }) => ({
        url: `${apiUrl}waInstance${idInstance}/lastOutgoingMessages/${apiTokenInstance}`,
        method: 'GET',
        params: {
          minutes,
        },
      }),
    }),
    lastMessages: builder.query<GetChatHistoryResponse, LastMessagesParametersInterface>({
      query: (params) => ({
        url: '',
        params,
      }),
      providesTags: ['lastMessages'],
    }),
  }),
});
