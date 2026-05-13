import { greenAPI } from 'services/green-api/green-api.service';
import {
  AddContactParametersInterface,
  CheckWhatsappParametersInterface,
  CheckWhatsappResponseInterface,
  ContactListItemInterface,
  DeleteContactParametersInterface,
  EditContactParametersInterface,
  EditMessageParameters,
  GetContactsParametersInterface,
  GetChatInformationParameters,
  GetChatsResponseInterface,
  GetContactInfoResponseInterface,
  InstanceInterface,
  RequestWithChatIdParameters,
  SendFileByUrlParametersInterface,
  SendingResponseInterface,
  UploadFileParametersInterface,
} from 'types';
import { normalizeAvatarSrc } from 'utils/image.utils';

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
    getContacts: builder.query<ContactListItemInterface[], GetContactsParametersInterface>({
      query: ({ idInstance, apiTokenInstance, apiUrl, mediaUrl: _, ...params }) => ({
        url: `${apiUrl}waInstance${idInstance}/getContacts/${apiTokenInstance}`,
        params,
      }),
      providesTags: ['contacts'],
    }),
    addContact: builder.mutation<Record<string, unknown>, AddContactParametersInterface>({
      query: ({ idInstance, apiTokenInstance, apiUrl, mediaUrl: _, ...body }) => ({
        url: `${apiUrl}waInstance${idInstance}/addContact/${apiTokenInstance}`,
        method: 'POST',
        body: {
          chatId: body.chatId,
          firstName: body.firstName,
          ...(body.lastName ? { lastName: body.lastName } : {}),
          saveInAddressbook: body.saveInAddressbook ?? true,
        },
      }),
      invalidatesTags: ['contacts'],
    }),
    editContact: builder.mutation<Record<string, unknown>, EditContactParametersInterface>({
      query: ({ idInstance, apiTokenInstance, apiUrl, mediaUrl: _, ...body }) => ({
        url: `${apiUrl}waInstance${idInstance}/editContact/${apiTokenInstance}`,
        method: 'POST',
        body: {
          chatId: body.chatId,
          firstName: body.firstName,
          ...(body.lastName ? { lastName: body.lastName } : {}),
          saveInAddressbook: body.saveInAddressbook ?? true,
        },
      }),
      invalidatesTags: ['contacts'],
    }),
    deleteContact: builder.mutation<Record<string, unknown>, DeleteContactParametersInterface>({
      query: ({ idInstance, apiTokenInstance, apiUrl, mediaUrl: _, ...body }) => ({
        url: `${apiUrl}waInstance${idInstance}/deleteContact/${apiTokenInstance}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['contacts'],
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
      transformResponse: (response: GetContactInfoResponseInterface) => ({
        ...response,
        avatar: normalizeAvatarSrc(response.base64Avatar) || normalizeAvatarSrc(response.avatar),
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
    getChats: builder.query<GetChatsResponseInterface[], InstanceInterface>({
      query: ({ idInstance, apiTokenInstance, apiUrl, mediaUrl: _ }) => ({
        url: `${apiUrl}waInstance${idInstance}/getChats/${apiTokenInstance}`,
      }),
    }),
  }),
});
