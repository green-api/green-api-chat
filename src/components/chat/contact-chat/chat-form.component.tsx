import { FC } from 'react';

import { Button, Form, Input } from 'antd';
import { useTranslation } from 'react-i18next';

import { useAppDispatch, useAppSelector } from 'hooks';
import { useSendMessageMutation } from 'services/green-api/endpoints';
import { journalsGreenApiEndpoints } from 'services/green-api/endpoints/journals.green-api.endpoints';
import { selectActiveChat } from 'store/slices/chat.slice';
import { selectCredentials } from 'store/slices/user.slice';

interface FormValues {
  message: string;
}

const ChatForm: FC = () => {
  const userCredentials = useAppSelector(selectCredentials);
  const activeChat = useAppSelector(selectActiveChat);

  const dispatch = useAppDispatch();

  const { t } = useTranslation();

  const [sendMessage, { isLoading }] = useSendMessageMutation();

  const [form] = Form.useForm<FormValues>();

  const onSendMessage = async (values: FormValues) => {
    const { message } = values;
    const body = {
      idInstance: userCredentials.idInstance,
      apiTokenInstance: userCredentials.apiTokenInstance,
      chatId: activeChat.chatId,
      message,
    };

    const { data } = await sendMessage(body);
    form.setFieldValue('message', '');

    if (data) {
      const updateChatHistoryThunk = journalsGreenApiEndpoints.util?.updateQueryData(
        'getChatHistory',
        {
          idInstance: userCredentials.idInstance,
          apiTokenInstance: userCredentials.apiTokenInstance,
          chatId: activeChat.chatId,
          count: 30,
        },
        (draftChatHistory) => {
          const existingMessage = draftChatHistory.find((msg) => msg.idMessage === data.idMessage);
          if (existingMessage) {
            console.log('message already in chat history');

            return;
          }

          draftChatHistory.push({
            type: 'outgoing',
            typeMessage: 'textMessage',
            textMessage: message,
            timestamp: Math.floor(Date.now() / 1000),
            senderName: '',
            senderContactName: '',
            idMessage: data.idMessage,
            chatId: activeChat.chatId,
          });

          return draftChatHistory;
        }
      );

      dispatch(updateChatHistoryThunk);
    }
  };

  return (
    <Form name="chat-form" className="chat-form" onFinish={onSendMessage} form={form}>
      <Form.Item
        name="message"
        rules={[{ required: true, message: t('EMPTY_FIELD_ERROR') }]}
        hasFeedback
      >
        <Input.TextArea placeholder={t('MESSAGE_PLACEHOLDER')} />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" className="login-form-button" loading={isLoading}>
          {t('SEND_MESSAGE')}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ChatForm;
