import { FC, useRef } from 'react';

import { Button, Form, Switch } from 'antd';
import { useTranslation } from 'react-i18next';

import { useActions, useAppDispatch, useAppSelector, useFormWithLanguageValidation } from 'hooks';
import { useDeleteMessageMutation } from 'services/green-api/endpoints';
import { journalsGreenApiEndpoints } from 'services/green-api/endpoints/journals.green-api.endpoints';
import { selectActiveChat, selectMessageCount, selectMiniVersion } from 'store/slices/chat.slice';
import { selectInstance } from 'store/slices/instances.slice';
import { selectMessageDataForRender } from 'store/slices/message-menu.slice';
import { ActiveChat, GetChatInformationParameters, MessageDataForRender } from 'types';

const DeleteMessageForm: FC = () => {
  const instanceCredentials = useAppSelector(selectInstance);
  const activeChat = useAppSelector(selectActiveChat) as ActiveChat;
  const deletedMessageData = useAppSelector(selectMessageDataForRender) as MessageDataForRender;
  const isMiniVersion = useAppSelector(selectMiniVersion);
  const messageCount = useAppSelector(selectMessageCount);

  const dispatch = useAppDispatch();
  const { setActiveServiceMethod } = useActions();

  const { t } = useTranslation();

  const [deleteMessage, { isLoading: isDeleteMessageLoading }] = useDeleteMessageMutation();

  const [form] = useFormWithLanguageValidation<
    Pick<GetChatInformationParameters, 'onlySenderDelete'> & { response: string }
  >();
  const responseTimerReference = useRef<number | null>(null);

  const onDeleteMessage = async (
    values: Pick<GetChatInformationParameters, 'onlySenderDelete'>
  ) => {
    const body = {
      ...instanceCredentials,
      chatId: activeChat.chatId,
      idMessage: deletedMessageData.idMessage,
      onlySenderDelete: values.onlySenderDelete ? true : undefined,
    };

    if (responseTimerReference.current) {
      clearTimeout(responseTimerReference.current);

      responseTimerReference.current = null;
    }

    form.setFields([{ name: 'response', errors: [], warnings: [] }]);

    const { data, error } = await deleteMessage(body);

    if (error && 'status' in error && error.status === 466) {
      form.setFields([{ name: 'response', errors: [t('QUOTE_EXCEEDED')] }]);

      return;
    }

    if (data || !error) {
      const updateChatHistoryThunk = journalsGreenApiEndpoints.util?.updateQueryData(
        'getChatHistory',
        {
          ...instanceCredentials,
          chatId: activeChat.chatId,
          count: isMiniVersion ? 10 : messageCount,
        },
        (draftChatHistory) => {
          const existingMessage = draftChatHistory.find(
            (msg) => msg.idMessage === deletedMessageData.idMessage
          );

          if (!existingMessage) {
            console.log('message not found in chat history');

            return;
          }

          existingMessage.isDeleted = true;

          return draftChatHistory;
        }
      );

      const updateChatListThunk = journalsGreenApiEndpoints.util?.updateQueryData(
        'lastMessages',
        instanceCredentials,
        (draftChatList) => {
          const existingChat = draftChatList.find(
            (msg) => msg.idMessage === deletedMessageData.idMessage
          );

          if (!existingChat) {
            return;
          }

          existingChat.isDeleted = true;

          return draftChatList;
        }
      );

      dispatch(updateChatHistoryThunk);
      dispatch(updateChatListThunk);

      form.resetFields();

      responseTimerReference.current = setTimeout(() => {
        form.setFields([{ name: 'response', errors: [], warnings: [] }]);
      }, 5000);

      setActiveServiceMethod(null);
    }
  };

  return (
    <Form
      name="delete-message-form"
      onFinish={onDeleteMessage}
      onSubmitCapture={() => form.setFields([{ name: 'response', errors: [], warnings: [] }])}
      form={form}
      onKeyDown={(e) => !e.ctrlKey && e.key === 'Enter' && form.submit()}
      disabled={isDeleteMessageLoading}
      style={{ borderRadius: 8 }}
    >
      <Form.Item name="onlySenderDelete" label={t('ONLY_SENDER_DELETE_LABEL')}>
        <Switch />
      </Form.Item>
      <Form.Item style={{ marginBottom: 0 }}>
        <Button
          disabled={isDeleteMessageLoading}
          htmlType="submit"
          size="large"
          block={true}
          type="primary"
        >
          {t('DELETE_MESSAGE')}
        </Button>
      </Form.Item>
      <Form.Item style={{ marginBottom: 0 }} name="response" className="response-form-item" />
    </Form>
  );
};

export default DeleteMessageForm;
