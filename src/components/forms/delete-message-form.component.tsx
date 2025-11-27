import { FC, useRef } from 'react';

import { Button, Flex, Form, Typography } from 'antd';
import useMessage from 'antd/es/message/useMessage';
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
  const [message, contextMessageHolder] = useMessage();

  const [deleteMessage, { isLoading: isDeleteMessageLoading }] = useDeleteMessageMutation();

  const [form] = useFormWithLanguageValidation<
    Pick<GetChatInformationParameters, 'onlySenderDelete'> & { response: string }
  >();
  const responseTimerReference = useRef<number | null>(null);

  const handleDelete = async (onlySenderDelete: boolean) => {
    const body = {
      ...instanceCredentials,
      chatId: activeChat.chatId,
      idMessage: deletedMessageData.idMessage,
      onlySenderDelete: onlySenderDelete ? true : undefined,
    };

    if (responseTimerReference.current) {
      clearTimeout(responseTimerReference.current);
      responseTimerReference.current = null;
    }

    form.setFields([{ name: 'response', errors: [], warnings: [] }]);

    const { data, error } = await deleteMessage(body);

    if (error) {
      message.error(t('ERROR_DELETING_MESSAGE'));
    }

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
          if (!existingMessage) return;
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
          if (!existingChat) return;
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
    <>
      <Typography.Paragraph>{t('DELETE_MESSAGE')}?</Typography.Paragraph>
      <Form name="delete-message-form" form={form} disabled={isDeleteMessageLoading}>
        <Flex style={{ flexDirection: 'column-reverse' }} gap={20} align="flex-end">
          <Form.Item noStyle>
            <Button
              // style={{ width: 120 }}
              size="middle"
              type="default"
              onClick={() => handleDelete(false)}
              disabled={isDeleteMessageLoading}
            >
              {t('DELETE_FOR_ALL')}
            </Button>
          </Form.Item>
          <Form.Item noStyle>
            <Button
              style={{ width: 120 }}
              size="middle"
              type="default"
              onClick={() => handleDelete(true)}
              disabled={isDeleteMessageLoading}
            >
              {t('DELETE_FOR_ME')}
            </Button>
          </Form.Item>

          <Form.Item name="response" className="response-form-item" />
        </Flex>
      </Form>
      {contextMessageHolder}
    </>
  );
};

export default DeleteMessageForm;
