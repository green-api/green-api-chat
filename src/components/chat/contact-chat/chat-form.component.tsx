import { FC } from 'react';

import { SendOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, Row } from 'antd';
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

    form.setFields([{ name: 'response', errors: [], warnings: [] }]);

    const { data, error } = await sendMessage(body);

    if (error && 'status' in error && error.status === 466) {
      form.setFields([{ name: 'response', errors: [t('QUOTE_EXCEEDED')] }]);

      return;
    }

    form.setFieldValue('message', '');

    if (data) {
      const updateChatHistoryThunk = journalsGreenApiEndpoints.util?.updateQueryData(
        'getChatHistory',
        {
          idInstance: userCredentials.idInstance,
          apiTokenInstance: userCredentials.apiTokenInstance,
          chatId: activeChat.chatId,
          count: 10,
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
            statusMessage: 'sent',
          });

          return draftChatHistory;
        }
      );

      dispatch(updateChatHistoryThunk);

      form.setFields([{ name: 'response', warnings: [t('SUCCESS_SENDING_MESSAGE')] }]);
    }
  };

  return (
    <Form
      name="chat-form"
      className="chat-form bg-color-second"
      onFinish={onSendMessage}
      form={form}
    >
      <Form.Item style={{ marginBottom: 0 }} name="response" className="response-form-item">
        <Row gutter={[15, 15]} align="bottom">
          <Col flex="auto">
            <Form.Item
              style={{ marginBottom: 0 }}
              name="message"
              rules={[{ required: true, message: t('EMPTY_FIELD_ERROR') }]}
            >
              <Input.TextArea
                autoSize={{ minRows: 5, maxRows: 5 }}
                maxLength={500}
                placeholder={t('MESSAGE_PLACEHOLDER')}
              />
            </Form.Item>
          </Col>
          <Col>
            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="link"
                htmlType="submit"
                size="large"
                className="login-form-button"
                loading={isLoading}
              >
                <SendOutlined />
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form.Item>
    </Form>
  );
};

export default ChatForm;
