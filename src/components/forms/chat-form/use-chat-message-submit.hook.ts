import { RefObject, useRef } from 'react';

import { Form } from 'antd';
import { TFunction } from 'i18next';

import { ContentEditableTextAreaRef } from 'components/UI/content-editable-text-area.component';
import { useActions, useAppDispatch } from 'hooks';
import { useSendMessageMutation } from 'services/green-api/endpoints';
import { journalsGreenApiEndpoints } from 'services/green-api/endpoints/journals.green-api.endpoints';
import { ActiveChat, ChatFormValues, MessageInterface, MessageDataForRender } from 'types';
import { updateAllChats } from 'utils';

type UseChatMessageSubmitParams = {
  form: ReturnType<typeof Form.useForm<ChatFormValues>>[0];
  instanceCredentials: {
    idInstance: number;
    apiTokenInstance: string;
    apiUrl: string;
    mediaUrl: string;
  };
  activeChat: ActiveChat;
  isMiniVersion: boolean;
  messageCount: number;
  replyMessage: MessageDataForRender | null;
  setInputValue: (value: string) => void;
  messageEditorRef: RefObject<ContentEditableTextAreaRef>;
  t: TFunction;
};

export const useChatMessageSubmit = ({
  form,
  instanceCredentials,
  activeChat,
  isMiniVersion,
  messageCount,
  replyMessage,
  setInputValue,
  messageEditorRef,
  t,
}: UseChatMessageSubmitParams) => {
  const dispatch = useAppDispatch();
  const { setReplyMessage } = useActions();
  const responseTimerReference = useRef<number | null>(null);
  const [sendMessage, { isLoading: isSendMessageLoading }] = useSendMessageMutation();

  const onSendMessage = async (values: ChatFormValues) => {
    const { message } = values;

    if (!message) {
      return;
    }

    const body = {
      ...instanceCredentials,
      chatId: activeChat.chatId,
      message,
    };

    if (replyMessage?.idMessage) {
      Object.assign(body, { quotedMessageId: replyMessage.idMessage });
    }

    if (responseTimerReference.current) {
      clearTimeout(responseTimerReference.current);
      responseTimerReference.current = null;
    }

    form.setFields([{ name: 'response', errors: [], warnings: [] }]);

    const { data, error } = await sendMessage(body);

    if (error && 'status' in error && error.status === 466) {
      form.setFields([{ name: 'response', errors: [t('QUOTE_EXCEEDED')] }]);
      return;
    }

    if (data) {
      const updateChatHistoryThunk = journalsGreenApiEndpoints.util?.updateQueryData(
        'getChatHistory',
        {
          ...instanceCredentials,
          chatId: activeChat.chatId,
          count: isMiniVersion ? 10 : messageCount,
        },
        (draftChatHistory) => {
          const existingMessage = draftChatHistory.find((msg) => msg.idMessage === data.idMessage);

          if (existingMessage) {
            console.log('message already in chat history');
            return;
          }

          const newMessage = {
            type: 'outgoing' as const,
            typeMessage: 'textMessage' as const,
            textMessage: message,
            timestamp: Math.floor(Date.now() / 1000),
            senderName: activeChat.senderName || '',
            senderContactName: activeChat.senderContactName || '',
            idMessage: data.idMessage,
            chatId: activeChat.chatId,
            statusMessage: 'sent' as const,
          };

          if (replyMessage?.idMessage) {
            Object.assign(newMessage, {
              quotedMessage: {
                stanzaId: replyMessage.idMessage,
                participant: JSON.parse(replyMessage?.jsonMessage).chatId,
                textMessage: replyMessage.textMessage,
              },
              typeMessage: 'extendedTextMessage',
            });
          }

          draftChatHistory.push(newMessage);

          return draftChatHistory;
        }
      );

      const updateChatListThunk = journalsGreenApiEndpoints.util?.updateQueryData(
        'lastMessages',
        { allMessages: true, ...instanceCredentials },
        (draftChatHistory) => {
          const newMessage: MessageInterface = {
            type: 'outgoing',
            typeMessage: 'textMessage',
            textMessage: message,
            timestamp: Math.floor(Date.now() / 1000),
            senderName: activeChat.senderName || '',
            senderContactName: activeChat.senderContactName || '',
            idMessage: data.idMessage,
            chatId: activeChat.chatId,
            statusMessage: 'sent',
          };

          return updateAllChats(draftChatHistory, [newMessage], []);
        }
      );

      dispatch(updateChatHistoryThunk);
      dispatch(updateChatListThunk);

      form.resetFields();
      setInputValue('');
      setReplyMessage(null);

      setTimeout(() => messageEditorRef.current?.focus(), 100);

      responseTimerReference.current = window.setTimeout(() => {
        form.setFields([{ name: 'response', errors: [], warnings: [] }]);
      }, 5000);
    }
  };

  return { onSendMessage, isSendMessageLoading };
};
