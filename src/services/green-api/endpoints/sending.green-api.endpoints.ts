import { journalsGreenApiEndpoints } from 'services/green-api/endpoints/journals.green-api.endpoints';
import { greenAPI } from 'services/green-api/green-api.service';
import type { RootState } from 'store';
import { chatActions, selectActiveChat, selectLastMessagesByChatId } from 'store/slices/chat.slice';
import {
  SendMessageParametersInterface,
  SendingResponseInterface,
  SendFileByUploadResponseInterface,
  SendFileByUploadParametersInterface,
  SendContactParametersInterface,
  SendLocationParametersInterface,
  SendPollParametersInterface,
  SendInteractiveButtonsInterface,
  GetChatHistoryParametersInterface,
} from 'types';
import { getFormData, getTextMessage } from 'utils';

export const sendingGreenApiEndpoints = greenAPI.injectEndpoints({
  endpoints: (builder) => ({
    sendMessage: builder.mutation<SendingResponseInterface, SendMessageParametersInterface>({
      query: ({ idInstance, apiTokenInstance, apiUrl, mediaUrl: _, ...body }) => ({
        url: `${apiUrl}waInstance${idInstance}/sendMessage/${apiTokenInstance}`,
        method: 'POST',
        body,
      }),
      onQueryStarted: async (
        { idInstance, chatId, message, quotedMessageId },
        { dispatch, getState, queryFulfilled }
      ) => {
        const state = getState() as RootState;
        const activeChat = selectActiveChat(state);
        const previousLastMessage = selectLastMessagesByChatId(state)[chatId] ?? null;
        const tempIdMessage = `temp-${crypto.randomUUID()}`;

        const chatHistoryEntries = journalsGreenApiEndpoints.util
          .selectInvalidatedBy(state, ['chatHistory'])
          .filter(
            (entry) =>
              entry.endpointName === 'getChatHistory' &&
              (entry.originalArgs as GetChatHistoryParametersInterface).chatId === chatId &&
              (entry.originalArgs as GetChatHistoryParametersInterface).idInstance === idInstance
          );

        const cachedHistory = chatHistoryEntries.length
          ? journalsGreenApiEndpoints.endpoints.getChatHistory.select(
              chatHistoryEntries[0].originalArgs as GetChatHistoryParametersInterface
            )(state).data
          : undefined;

        const optimisticMessage = {
          type: 'outgoing' as const,
          typeMessage: 'textMessage' as const,
          textMessage: message,
          timestamp: Math.floor(Date.now() / 1000),
          senderName: activeChat?.senderName || '',
          senderContactName: activeChat?.senderContactName || '',
          idMessage: tempIdMessage,
          chatId,
          statusMessage: 'pending' as const,
        };

        if (quotedMessageId && cachedHistory) {
          const quotedSource = cachedHistory.find((msg) => msg.idMessage === quotedMessageId);

          if (quotedSource) {
            Object.assign(optimisticMessage, {
              typeMessage: 'extendedTextMessage',
              quotedMessage: {
                stanzaId: quotedMessageId,
                participant: quotedSource.chatId,
                textMessage: getTextMessage(quotedSource),
              },
            });
          }
        }

        const patches = chatHistoryEntries.map(({ originalArgs }) =>
          dispatch(
            journalsGreenApiEndpoints.util.updateQueryData(
              'getChatHistory',
              originalArgs as GetChatHistoryParametersInterface,
              (draft) => {
                draft.push({ ...optimisticMessage });

                return draft;
              }
            )
          )
        );

        dispatch(chatActions.setLastMessageByChatId({ chatId, message: optimisticMessage }));

        try {
          const { data } = await queryFulfilled;

          chatHistoryEntries.forEach(({ originalArgs }) =>
            dispatch(
              journalsGreenApiEndpoints.util.updateQueryData(
                'getChatHistory',
                originalArgs as GetChatHistoryParametersInterface,
                (draft) => {
                  const pendingMessage = draft.find((msg) => msg.idMessage === tempIdMessage);

                  if (!pendingMessage) return;

                  pendingMessage.idMessage = data.idMessage;
                  pendingMessage.statusMessage = 'sent';
                }
              )
            )
          );

          dispatch(
            chatActions.setLastMessageByChatId({
              chatId,
              message: { ...optimisticMessage, idMessage: data.idMessage, statusMessage: 'sent' },
            })
          );
        } catch {
          patches.forEach((patch) => patch.undo());
          dispatch(chatActions.setLastMessageByChatId({ chatId, message: previousLastMessage }));
        }
      },
    }),
    sendContact: builder.mutation<SendingResponseInterface, SendContactParametersInterface>({
      query: ({ idInstance, apiTokenInstance, apiUrl, mediaUrl: _, ...body }) => ({
        url: `${apiUrl}waInstance${idInstance}/sendContact/${apiTokenInstance}`,
        method: 'POST',
        body,
      }),
      onQueryStarted: async (
        { idInstance, chatId, contact },
        { dispatch, getState, queryFulfilled }
      ) => {
        const state = getState() as RootState;
        const previousLastMessage = selectLastMessagesByChatId(state)[chatId] ?? null;
        const tempIdMessage = `temp-${crypto.randomUUID()}`;

        const contactDisplayName =
          'chatId' in contact
            ? contact.chatId
            : `${contact.firstName || ''} ${contact.middleName || ''} ${contact.lastName || ''}`.trim() ||
              String(contact.phoneContact);

        const chatHistoryEntries = journalsGreenApiEndpoints.util
          .selectInvalidatedBy(state, ['chatHistory'])
          .filter(
            (entry) =>
              entry.endpointName === 'getChatHistory' &&
              (entry.originalArgs as GetChatHistoryParametersInterface).chatId === chatId &&
              (entry.originalArgs as GetChatHistoryParametersInterface).idInstance === idInstance
          );

        const optimisticMessage = {
          type: 'outgoing' as const,
          typeMessage: 'contactMessage' as const,
          contact: { displayName: contactDisplayName, vcard: '' },
          timestamp: Math.floor(Date.now() / 1000),
          senderName: '',
          senderContactName: '',
          idMessage: tempIdMessage,
          chatId,
          statusMessage: 'pending' as const,
        };

        const patches = chatHistoryEntries.map(({ originalArgs }) =>
          dispatch(
            journalsGreenApiEndpoints.util.updateQueryData(
              'getChatHistory',
              originalArgs as GetChatHistoryParametersInterface,
              (draft) => {
                draft.push({ ...optimisticMessage });

                return draft;
              }
            )
          )
        );

        dispatch(chatActions.setLastMessageByChatId({ chatId, message: optimisticMessage }));

        try {
          const { data } = await queryFulfilled;

          chatHistoryEntries.forEach(({ originalArgs }) =>
            dispatch(
              journalsGreenApiEndpoints.util.updateQueryData(
                'getChatHistory',
                originalArgs as GetChatHistoryParametersInterface,
                (draft) => {
                  const pendingMessage = draft.find((msg) => msg.idMessage === tempIdMessage);

                  if (!pendingMessage) return;

                  pendingMessage.idMessage = data.idMessage;
                  pendingMessage.statusMessage = 'sent';
                }
              )
            )
          );

          dispatch(
            chatActions.setLastMessageByChatId({
              chatId,
              message: { ...optimisticMessage, idMessage: data.idMessage, statusMessage: 'sent' },
            })
          );
        } catch {
          patches.forEach((patch) => patch.undo());
          dispatch(chatActions.setLastMessageByChatId({ chatId, message: previousLastMessage }));
        }
      },
    }),
    sendLocation: builder.mutation<SendingResponseInterface, SendLocationParametersInterface>({
      query: ({ idInstance, apiTokenInstance, apiUrl, mediaUrl: _, ...body }) => ({
        url: `${apiUrl}waInstance${idInstance}/sendLocation/${apiTokenInstance}`,
        method: 'POST',
        body,
      }),
      onQueryStarted: async (
        { idInstance, chatId, latitude, longitude, nameLocation, address },
        { dispatch, getState, queryFulfilled }
      ) => {
        const state = getState() as RootState;
        const previousLastMessage = selectLastMessagesByChatId(state)[chatId] ?? null;
        const tempIdMessage = `temp-${crypto.randomUUID()}`;

        const chatHistoryEntries = journalsGreenApiEndpoints.util
          .selectInvalidatedBy(state, ['chatHistory'])
          .filter(
            (entry) =>
              entry.endpointName === 'getChatHistory' &&
              (entry.originalArgs as GetChatHistoryParametersInterface).chatId === chatId &&
              (entry.originalArgs as GetChatHistoryParametersInterface).idInstance === idInstance
          );

        const optimisticMessage = {
          type: 'outgoing' as const,
          typeMessage: 'locationMessage' as const,
          location: {
            nameLocation,
            address,
            latitude: String(latitude),
            longitude: String(longitude),
            jpegThumbnail: '',
          },
          timestamp: Math.floor(Date.now() / 1000),
          senderName: '',
          senderContactName: '',
          idMessage: tempIdMessage,
          chatId,
          statusMessage: 'pending' as const,
        };

        const patches = chatHistoryEntries.map(({ originalArgs }) =>
          dispatch(
            journalsGreenApiEndpoints.util.updateQueryData(
              'getChatHistory',
              originalArgs as GetChatHistoryParametersInterface,
              (draft) => {
                draft.push({ ...optimisticMessage });

                return draft;
              }
            )
          )
        );

        dispatch(chatActions.setLastMessageByChatId({ chatId, message: optimisticMessage }));

        try {
          const { data } = await queryFulfilled;

          chatHistoryEntries.forEach(({ originalArgs }) =>
            dispatch(
              journalsGreenApiEndpoints.util.updateQueryData(
                'getChatHistory',
                originalArgs as GetChatHistoryParametersInterface,
                (draft) => {
                  const pendingMessage = draft.find((msg) => msg.idMessage === tempIdMessage);

                  if (!pendingMessage) return;

                  pendingMessage.idMessage = data.idMessage;
                  pendingMessage.statusMessage = 'sent';
                }
              )
            )
          );

          dispatch(
            chatActions.setLastMessageByChatId({
              chatId,
              message: { ...optimisticMessage, idMessage: data.idMessage, statusMessage: 'sent' },
            })
          );
        } catch {
          patches.forEach((patch) => patch.undo());
          dispatch(chatActions.setLastMessageByChatId({ chatId, message: previousLastMessage }));
        }
      },
    }),
    sendPoll: builder.mutation<SendingResponseInterface, SendPollParametersInterface>({
      query: ({ idInstance, apiTokenInstance, apiUrl, mediaUrl: _, ...body }) => ({
        url: `${apiUrl}waInstance${idInstance}/sendPoll/${apiTokenInstance}`,
        method: 'POST',
        body,
      }),
      onQueryStarted: async (
        { idInstance, chatId, message, options, multipleAnswers },
        { dispatch, getState, queryFulfilled }
      ) => {
        const state = getState() as RootState;
        const previousLastMessage = selectLastMessagesByChatId(state)[chatId] ?? null;
        const tempIdMessage = `temp-${crypto.randomUUID()}`;

        const chatHistoryEntries = journalsGreenApiEndpoints.util
          .selectInvalidatedBy(state, ['chatHistory'])
          .filter(
            (entry) =>
              entry.endpointName === 'getChatHistory' &&
              (entry.originalArgs as GetChatHistoryParametersInterface).chatId === chatId &&
              (entry.originalArgs as GetChatHistoryParametersInterface).idInstance === idInstance
          );

        const optimisticMessage = {
          type: 'outgoing' as const,
          typeMessage: 'pollMessage' as const,
          timestamp: Math.floor(Date.now() / 1000),
          senderName: '',
          senderContactName: '',
          idMessage: tempIdMessage,
          pollMessageData: {
            name: message,
            options,
            multipleAnswers: multipleAnswers ?? false,
          },
          chatId,
          statusMessage: 'pending' as const,
        };

        const patches = chatHistoryEntries.map(({ originalArgs }) =>
          dispatch(
            journalsGreenApiEndpoints.util.updateQueryData(
              'getChatHistory',
              originalArgs as GetChatHistoryParametersInterface,
              (draft) => {
                draft.push({ ...optimisticMessage });

                return draft;
              }
            )
          )
        );

        dispatch(chatActions.setLastMessageByChatId({ chatId, message: optimisticMessage }));

        try {
          const { data } = await queryFulfilled;

          chatHistoryEntries.forEach(({ originalArgs }) =>
            dispatch(
              journalsGreenApiEndpoints.util.updateQueryData(
                'getChatHistory',
                originalArgs as GetChatHistoryParametersInterface,
                (draft) => {
                  const pendingMessage = draft.find((msg) => msg.idMessage === tempIdMessage);

                  if (!pendingMessage) return;

                  pendingMessage.idMessage = data.idMessage;
                  pendingMessage.statusMessage = 'sent';
                }
              )
            )
          );

          dispatch(
            chatActions.setLastMessageByChatId({
              chatId,
              message: { ...optimisticMessage, idMessage: data.idMessage, statusMessage: 'sent' },
            })
          );
        } catch {
          patches.forEach((patch) => patch.undo());
          dispatch(chatActions.setLastMessageByChatId({ chatId, message: previousLastMessage }));
        }
      },
    }),
    sendFileByUpload: builder.mutation<
      SendFileByUploadResponseInterface,
      SendFileByUploadParametersInterface
    >({
      query: ({ idInstance, apiTokenInstance, mediaUrl, apiUrl: _, ...body }) => ({
        url: `${mediaUrl}waInstance${idInstance}/sendFileByUpload/${apiTokenInstance}`,
        method: 'POST',
        body: getFormData(body),
        formData: true,
      }),
      onQueryStarted: async (
        { idInstance, chatId, file, fileName, caption },
        { dispatch, getState, queryFulfilled }
      ) => {
        const state = getState() as RootState;
        const previousLastMessage = selectLastMessagesByChatId(state)[chatId] ?? null;
        const tempIdMessage = `temp-${crypto.randomUUID()}`;

        const chatHistoryEntries = journalsGreenApiEndpoints.util
          .selectInvalidatedBy(state, ['chatHistory'])
          .filter(
            (entry) =>
              entry.endpointName === 'getChatHistory' &&
              (entry.originalArgs as GetChatHistoryParametersInterface).chatId === chatId &&
              (entry.originalArgs as GetChatHistoryParametersInterface).idInstance === idInstance
          );

        const optimisticMessage = {
          type: 'outgoing' as const,
          typeMessage: 'documentMessage' as const, // TODO: check on message type
          fileName: fileName || file.name,
          caption,
          timestamp: Math.floor(Date.now() / 1000),
          senderName: '',
          senderContactName: '',
          idMessage: tempIdMessage,
          chatId,
          statusMessage: 'pending' as const,
        };

        const patches = chatHistoryEntries.map(({ originalArgs }) =>
          dispatch(
            journalsGreenApiEndpoints.util.updateQueryData(
              'getChatHistory',
              originalArgs as GetChatHistoryParametersInterface,
              (draft) => {
                draft.push({ ...optimisticMessage });

                return draft;
              }
            )
          )
        );

        dispatch(chatActions.setLastMessageByChatId({ chatId, message: optimisticMessage }));

        try {
          const { data } = await queryFulfilled;

          chatHistoryEntries.forEach(({ originalArgs }) =>
            dispatch(
              journalsGreenApiEndpoints.util.updateQueryData(
                'getChatHistory',
                originalArgs as GetChatHistoryParametersInterface,
                (draft) => {
                  const pendingMessage = draft.find((msg) => msg.idMessage === tempIdMessage);

                  if (!pendingMessage) return;

                  pendingMessage.idMessage = data.idMessage;
                  pendingMessage.statusMessage = 'sent';
                  pendingMessage.downloadUrl = data.urlFile;
                }
              )
            )
          );

          dispatch(
            chatActions.setLastMessageByChatId({
              chatId,
              message: {
                ...optimisticMessage,
                idMessage: data.idMessage,
                statusMessage: 'sent',
                downloadUrl: data.urlFile,
              },
            })
          );
        } catch {
          patches.forEach((patch) => patch.undo());
          dispatch(chatActions.setLastMessageByChatId({ chatId, message: previousLastMessage }));
        }
      },
    }),
    sendInteractiveButtons: builder.mutation<
      SendingResponseInterface,
      SendInteractiveButtonsInterface
    >({
      query: ({ idInstance, apiTokenInstance, apiUrl, mediaUrl: _, ...body }) => {
        const buttonsWithId = body.buttons.map((button, index) => ({
          ...button,
          buttonId: (index + 1).toString(),
        }));

        return {
          url: `${apiUrl}waInstance${idInstance}/sendInteractiveButtons/${apiTokenInstance}`,
          method: 'POST',
          body: {
            ...body,
            buttons: buttonsWithId,
          },
        };
      },
    }),
    sendInteractiveButtonsReply: builder.mutation<
      SendingResponseInterface,
      SendInteractiveButtonsInterface
    >({
      query: ({ idInstance, apiTokenInstance, apiUrl, mediaUrl: _, ...body }) => {
        const buttonsWithId = body.buttons.map((button, index) => ({
          ...button,
          buttonId: (index + 1).toString(),
        }));

        return {
          url: `${apiUrl}waInstance${idInstance}/sendInteractiveButtonsReply/${apiTokenInstance}`,
          method: 'POST',
          body: {
            ...body,
            buttons: buttonsWithId,
          },
        };
      },
    }),
  }),
});
