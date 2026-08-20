import { RefObject, useRef } from 'react';

import { Form } from 'antd';
import { TFunction } from 'i18next';

import { ContentEditableTextAreaRef } from 'components/UI/content-editable-text-area.component';
import { useActions } from 'hooks';
import { useSendMessageMutation } from 'services/green-api/endpoints';
import { ActiveChat, ChatFormValues, MessageDataForRender } from 'types';

type UseChatMessageSubmitParams = {
  form: ReturnType<typeof Form.useForm<ChatFormValues>>[0];
  instanceCredentials: {
    idInstance: number;
    apiTokenInstance: string;
    apiUrl: string;
    mediaUrl: string;
  };
  activeChat: ActiveChat;
  replyMessage: MessageDataForRender | null;
  setInputValue: (value: string) => void;
  messageEditorRef: RefObject<ContentEditableTextAreaRef>;
  t: TFunction;
};

export const useChatMessageSubmit = ({
  form,
  instanceCredentials,
  activeChat,
  replyMessage,
  setInputValue,
  messageEditorRef,
  t,
}: UseChatMessageSubmitParams) => {
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
