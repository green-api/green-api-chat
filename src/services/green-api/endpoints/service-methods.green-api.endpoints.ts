import { greenAPI } from 'services/green-api/green-api.service';
import {
  CheckWhatsappParametersInterface,
  CheckWhatsappResponseInterface,
  EditMessageParameters,
  GetAvatarResponseInterface,
  GetChatInformationParameters,
  GetContactInfoResponseInterface,
  RequestWithChatIdParameters,
  SendingResponseInterface,
} from 'types';

export const serviceMethodsGreenApiEndpoints = greenAPI.injectEndpoints({
  endpoints: (builder) => ({
    checkWhatsapp: builder.mutation<
      CheckWhatsappResponseInterface,
      CheckWhatsappParametersInterface
    >({
      query: ({ idInstance, apiTokenInstance, apiUrl, mediaUrl: _, ...body }) => ({
        url: `${apiUrl}waInstance${idInstance}/checkWhatsapp/${apiTokenInstance}`,
        method: 'POST',
        body,
      }),
    }),
    getAvatar: builder.query<GetAvatarResponseInterface, RequestWithChatIdParameters>({
      query: ({ idInstance, apiTokenInstance, apiUrl, mediaUrl: _, ...body }) => ({
        url: `${apiUrl}waInstance${idInstance}/getAvatar/${apiTokenInstance}`,
        method: 'POST',
        body,
      }),
      keepUnusedDataFor: 1000,
    }),
    getContactInfo: builder.query<GetContactInfoResponseInterface, RequestWithChatIdParameters>({
      query: ({ idInstance, apiTokenInstance, apiUrl, mediaUrl: _, ...body }) => ({
        url: `${apiUrl}waInstance${idInstance}/getContactInfo/${apiTokenInstance}`,
        method: 'POST',
        body,
      }),
      keepUnusedDataFor: 1000,
    }),
    deleteMessage: builder.mutation<void, GetChatInformationParameters>({
      query: ({ idInstance, apiTokenInstance, apiUrl, mediaUrl: _, ...body }) => ({
        url: `${apiUrl}waInstance${idInstance}/deleteMessage/${apiTokenInstance}`,
        method: 'POST',
        body,
      }),
    }),
    editMessage: builder.mutation<SendingResponseInterface, EditMessageParameters>({
      query: ({ idInstance, apiTokenInstance, apiUrl, mediaUrl: _, ...body }) => ({
        url: `${apiUrl}waInstance${idInstance}/editMessage/${apiTokenInstance}`,
        method: 'POST',
        body,
      }),
    }),
  }),
});
