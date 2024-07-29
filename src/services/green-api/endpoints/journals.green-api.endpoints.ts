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
    lastIncomingMessages: builder.query<MessageInterface, LastMessagesParametersInterface>({
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
    lastOutgoingMessages: builder.query<MessageInterface, LastMessagesParametersInterface>({
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
  }),
});
