import { greenAPI } from 'services/green-api/green-api.service';
import {
  CheckWhatsappParametersInterface,
  CheckWhatsappResponseInterface,
  EditMessageParameters,
  GetAvatarResponseInterface,
  GetChatInformationParameters,
  GetContactInfoResponseInterface,
  RequestWithChatIdParameters,
  SendFileByUrlParametersInterface,
  SendingResponseInterface,
  UploadFileParametersInterface,
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
      providesTags: (result, error, { chatId }) => [{ type: 'avatar', id: chatId }],
    }),
    uploadFile: builder.mutation<
      Pick<SendFileByUrlParametersInterface, 'urlFile'>,
      UploadFileParametersInterface
    >({
      query: ({ idInstance, apiTokenInstance, apiUrl, mediaUrl: _, ...body }) => ({
        url: `${apiUrl}waInstance${idInstance}/UploadFile/${apiTokenInstance}`,
        method: 'POST',
        headers: {
          'content-type': body.file.type,
        },
        body: body.file,
      }),
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
    editMessage: builder.mutation<
      SendingResponseInterface,
      Omit<EditMessageParameters, 'onlySenderDelete'>
    >({
      query: ({ idInstance, apiTokenInstance, apiUrl, mediaUrl: _, ...body }) => ({
        url: `${apiUrl}waInstance${idInstance}/editMessage/${apiTokenInstance}`,
        method: 'POST',
        body,
      }),
    }),
  }),
});
