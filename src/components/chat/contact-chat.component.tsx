import { FC } from 'react';

import { Button, Card, Form, Input } from 'antd';
import { useTranslation } from 'react-i18next';

import Message from './message.component';
import { useAppSelector } from 'hooks';
import { useGetChatHistoryQuery, useSendMessageMutation } from 'services/green-api/endpoints';
import { selectActiveChat } from 'store/slices/chat.slice';
import { selectCredentials } from 'store/slices/user.slice';

interface FormValues {
  message: string;
}

const ContactChat: FC = () => {
  const userCredentials = useAppSelector(selectCredentials);
  const activeChat = useAppSelector(selectActiveChat);

  const { t } = useTranslation();

  const [form] = Form.useForm<FormValues>();

  const { data: messages } = useGetChatHistoryQuery({
    idInstance: userCredentials.idInstance,
    apiTokenInstance: userCredentials.apiTokenInstance,
    chatId: activeChat.chatId,
    count: 30,
  });

  const [sendMessage, { isLoading }] = useSendMessageMutation();

  const onSendMessage = async (values: FormValues) => {
    const { message } = values;
    const body = {
      idInstance: userCredentials.idInstance,
      apiTokenInstance: userCredentials.apiTokenInstance,
      chatId: activeChat.chatId,
      message,
    };

    await sendMessage(body);
    form.setFieldValue('message', '');
  };

  return (
    <div className="chat-form-wrapper">
      <Card className="chat-view" bordered={false} style={{ boxShadow: 'unset' }}>
        {messages?.map((message, idx) => {
          return (
            <Message
              key={message.idMessage}
              type={message.type}
              textMessage={
                message.extendedTextMessage?.text || message.textMessage || message.typeMessage
              }
              senderName={message.type === 'outgoing' ? 'Вы' : activeChat.senderName!}
              isLastMessage={idx === messages?.length - 1}
              timestamp={message.timestamp}
            />
          );
        })}
      </Card>
      <Form name="chat-form" className="chat-form" onFinish={onSendMessage} form={form}>
        <Form.Item
          name="message"
          rules={[{ required: true, message: t('EMPTY_FIELD_ERROR') }]}
          hasFeedback
        >
          <Input.TextArea placeholder={t('MESSAGE_PLACEHOLDER')} />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="login-form-button"
            loading={isLoading}
          >
            Отправить сообщение
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ContactChat;
