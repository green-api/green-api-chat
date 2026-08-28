import { journalsGreenApiEndpoints } from 'services/green-api/endpoints/journals.green-api.endpoints';
import { greenAPI } from 'services/green-api/green-api.service';
import type { RootState } from 'store';
import { chatActions, selectLastMessagesByChatId } from 'store/slices/chat.slice';
import {
  AddContactParametersInterface,
  CheckWhatsappParametersInterface,
  CheckWhatsappResponseInterface,
  ContactListItemInterface,
  DeleteContactParametersInterface,
  EditContactParametersInterface,
  EditMessageParameters,
  GetChatHistoryParametersInterface,
  GetContactsParametersInterface,
  GetChatInformationParameters,
  GetChatsParametersInterface,
  GetChatsResponseInterface,
  GetContactInfoResponseInterface,
  MessageInterface,
  RequestWithChatIdParameters,
  SendFileByUrlParametersInterface,
  SendingResponseInterface,
  UploadFileParametersInterface,
  CheckAccountResponseInterface,
  CheckAccountParametersInterface,
} from 'types';
import { normalizeAvatarSrc } from 'utils/image.utils';

const applyMessageEdit = (msg: MessageInterface, message: string): MessageInterface => {
  const updated = { ...msg };

  if (updated.extendedTextMessage) {
    updated.extendedTextMessage = { ...updated.extendedTextMessage, text: message };
  } else if ('caption' in updated) {
    updated.caption = message;
  } else {
    updated.textMessage = message;
  }

  updated.isEdited = true;

  return updated;
};

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
    checkAccount: builder.mutation<CheckAccountResponseInterface, CheckAccountParametersInterface>({
      query: ({ idInstance, apiTokenInstance, apiUrl, mediaUrl: _, ...body }) => ({
        url: `${apiUrl}waInstance${idInstance}/checkAccount/${apiTokenInstance}`,
        method: 'POST',
        body,
      }),
    }),
    getContacts: builder.query<ContactListItemInterface[], GetContactsParametersInterface>({
      query: ({ idInstance, apiTokenInstance, apiUrl, mediaUrl: _, ...params }) => ({
        url: `${apiUrl}waInstance${idInstance}/getContacts/${apiTokenInstance}`,
        params,
      }),
      transformResponse: (response: ContactListItemInterface[]) =>
        response.map((contact) => ({ ...contact, id: contact.id ?? contact.chatId ?? '' })),
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
          saveInAddressbook: body.saveInAddressbook,
        },
      }),
      onQueryStarted: async ({ chatId, firstName }, { dispatch, getState, queryFulfilled }) => {
        const optimisticContact: ContactListItemInterface = {
          id: chatId,
          name: firstName,
          contactName: firstName,
          type: 'user',
        };

        const patches = serviceMethodsGreenApiEndpoints.util
          .selectInvalidatedBy(getState() as RootState, ['contacts'])
          .filter((entry) => entry.endpointName === 'getContacts')
          .map(({ originalArgs }) =>
            dispatch(
              serviceMethodsGreenApiEndpoints.util.updateQueryData(
                'getContacts',
                originalArgs as GetContactsParametersInterface,
                (draft) => {
                  const existingIndex = draft.findIndex((contact) => contact.id === chatId);

                  if (existingIndex !== -1) {
                    draft[existingIndex] = { ...draft[existingIndex], ...optimisticContact };
                  } else {
                    draft.unshift(optimisticContact);
                  }
                }
              )
            )
          );

        try {
          await queryFulfilled;

          setTimeout(() => {
            dispatch(serviceMethodsGreenApiEndpoints.util.invalidateTags(['contacts']));
          }, 1500);
        } catch {
          patches.forEach((patch) => patch.undo());
        }
      },
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
          saveInAddressbook: body.saveInAddressbook,
        },
      }),
      onQueryStarted: async ({ chatId, firstName }, { dispatch, getState, queryFulfilled }) => {
        const patches = serviceMethodsGreenApiEndpoints.util
          .selectInvalidatedBy(getState() as RootState, ['contacts'])
          .filter((entry) => entry.endpointName === 'getContacts')
          .map(({ originalArgs }) =>
            dispatch(
              serviceMethodsGreenApiEndpoints.util.updateQueryData(
                'getContacts',
                originalArgs as GetContactsParametersInterface,
                (draft) => {
                  const contact = draft.find((item) => item.id === chatId);

                  if (contact) {
                    contact.name = firstName;
                    contact.contactName = firstName;
                  }
                }
              )
            )
          );

        try {
          await queryFulfilled;

          setTimeout(() => {
            dispatch(serviceMethodsGreenApiEndpoints.util.invalidateTags(['contacts']));
          }, 1500);
        } catch {
          patches.forEach((patch) => patch.undo());
        }
      },
      invalidatesTags: ['contacts'],
    }),
    deleteContact: builder.mutation<Record<string, unknown>, DeleteContactParametersInterface>({
      query: ({ idInstance, apiTokenInstance, apiUrl, mediaUrl: _, ...body }) => ({
        url: `${apiUrl}waInstance${idInstance}/deleteContact/${apiTokenInstance}`,
        method: 'POST',
        body,
      }),
      onQueryStarted: async ({ chatId }, { dispatch, getState, queryFulfilled }) => {
        const patches = serviceMethodsGreenApiEndpoints.util
          .selectInvalidatedBy(getState() as RootState, ['contacts'])
          .filter((entry) => entry.endpointName === 'getContacts')
          .map(({ originalArgs }) =>
            dispatch(
              serviceMethodsGreenApiEndpoints.util.updateQueryData(
                'getContacts',
                originalArgs as GetContactsParametersInterface,
                (draft) => {
                  const index = draft.findIndex((contact) => contact.id === chatId);

                  if (index !== -1) {
                    draft.splice(index, 1);
                  }
                }
              )
            )
          );

        try {
          await queryFulfilled;

          setTimeout(() => {
            dispatch(serviceMethodsGreenApiEndpoints.util.invalidateTags(['contacts']));
          }, 1500);
        } catch {
          patches.forEach((patch) => patch.undo());
        }
      },
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
      onQueryStarted: async (
        { idInstance, chatId, idMessage },
        { dispatch, getState, queryFulfilled }
      ) => {
        const state = getState() as RootState;

        const patches = journalsGreenApiEndpoints.util
          .selectInvalidatedBy(state, ['chatHistory'])
          .filter(
            (entry) =>
              entry.endpointName === 'getChatHistory' &&
              (entry.originalArgs as GetChatHistoryParametersInterface).chatId === chatId &&
              (entry.originalArgs as GetChatHistoryParametersInterface).idInstance === idInstance
          )
          .map(({ originalArgs }) =>
            dispatch(
              journalsGreenApiEndpoints.util.updateQueryData(
                'getChatHistory',
                originalArgs as GetChatHistoryParametersInterface,
                (draft) => {
                  const existingMessage = draft.find((msg) => msg.idMessage === idMessage);

                  if (!existingMessage) return;

                  existingMessage.isDeleted = true;
                }
              )
            )
          );

        const previousLastMessage = selectLastMessagesByChatId(state)[chatId] ?? null;
        const isDeletingLastMessage = previousLastMessage?.idMessage === idMessage;

        if (isDeletingLastMessage && previousLastMessage) {
          dispatch(
            chatActions.setLastMessageByChatId({
              chatId,
              message: { ...previousLastMessage, isDeleted: true },
            })
          );
        }

        try {
          await queryFulfilled;
        } catch {
          patches.forEach((patch) => patch.undo());

          if (isDeletingLastMessage) {
            dispatch(chatActions.setLastMessageByChatId({ chatId, message: previousLastMessage }));
          }
        }
      },
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
      onQueryStarted: async (
        { idInstance, chatId, idMessage, message },
        { dispatch, getState, queryFulfilled }
      ) => {
        const state = getState() as RootState;

        const patches = journalsGreenApiEndpoints.util
          .selectInvalidatedBy(state, ['chatHistory'])
          .filter(
            (entry) =>
              entry.endpointName === 'getChatHistory' &&
              (entry.originalArgs as GetChatHistoryParametersInterface).chatId === chatId &&
              (entry.originalArgs as GetChatHistoryParametersInterface).idInstance === idInstance
          )
          .map(({ originalArgs }) =>
            dispatch(
              journalsGreenApiEndpoints.util.updateQueryData(
                'getChatHistory',
                originalArgs as GetChatHistoryParametersInterface,
                (draft) => {
                  const existingMessage = draft.find((msg) => msg.idMessage === idMessage);

                  if (!existingMessage) return;

                  if (existingMessage.extendedTextMessage) {
                    existingMessage.extendedTextMessage.text = message;
                  } else if ('caption' in existingMessage) {
                    existingMessage.caption = message;
                  } else {
                    existingMessage.textMessage = message;
                  }

                  existingMessage.isEdited = true;
                }
              )
            )
          );

        const previousLastMessage = selectLastMessagesByChatId(state)[chatId] ?? null;
        const isEditingLastMessage = previousLastMessage?.idMessage === idMessage;

        if (isEditingLastMessage && previousLastMessage) {
          dispatch(
            chatActions.setLastMessageByChatId({
              chatId,
              message: applyMessageEdit(previousLastMessage, message),
            })
          );
        }

        try {
          await queryFulfilled;
        } catch {
          patches.forEach((patch) => patch.undo());

          if (isEditingLastMessage) {
            dispatch(chatActions.setLastMessageByChatId({ chatId, message: previousLastMessage }));
          }
        }
      },
    }),
    getChats: builder.query<GetChatsResponseInterface[], GetChatsParametersInterface>({
      query: ({ idInstance, apiTokenInstance, apiUrl, mediaUrl: _, ...params }) => ({
        url: `${apiUrl}waInstance${idInstance}/getChats/${apiTokenInstance}`,
        params,
      }),
      transformResponse: (response: GetChatsResponseInterface[]) =>
        response.map((chat) => ({
          ...chat,
          chatId: chat.chatId || chat.id || '',
        })),
      providesTags: ['chats'],
    }),
  }),
});
