import { FC } from 'react';

import { Button, Card, Form, Input } from 'antd';

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

  const [form] = Form.useForm<FormValues>();

  const { data: messages } = useGetChatHistoryQuery({
    idInstance: userCredentials.idInstance,
    apiTokenInstance: userCredentials.apiTokenInstance,
    chatId: activeChat.chatId,
    count: 100,
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
      <Card className="card">
        {messages?.map((message) => {
          return (
            <Message
              key={message.idMessage}
              type={message.type}
              textMessage={
                message.extendedTextMessage?.text || message.textMessage || message.typeMessage
              }
              senderName={message.type === 'outgoing' ? 'Вы' : activeChat.senderName!}
            />
          );
        })}
      </Card>
      <Form name="chat-form" onFinish={onSendMessage} form={form}>
        <Form.Item
          name="message"
          rules={[{ required: true, message: 'Сообщение не может быть пустым!' }]}
          hasFeedback
        >
          <Input.TextArea maxLength={300} showCount={true} placeholder="Введите сообщение.." />
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
