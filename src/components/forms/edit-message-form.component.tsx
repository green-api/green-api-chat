import { FC, useRef } from 'react';

import { SendOutlined } from '@ant-design/icons';
import { Button, Col, Form, Row } from 'antd';
import { useTranslation } from 'react-i18next';

import TextArea from 'components/UI/text-area.component';
import { useActions, useAppSelector, useFormWithLanguageValidation } from 'hooks';
import { useEditMessageMutation } from 'services/green-api/endpoints';
import { selectActiveChat } from 'store/slices/chat.slice';
import { selectInstance } from 'store/slices/instances.slice';
import { selectMessageDataForRender } from 'store/slices/message-menu.slice';
import { ActiveChat, ChatFormValues, MessageDataForRender } from 'types';

const EditMessageForm: FC = () => {
  const instanceCredentials = useAppSelector(selectInstance);
  const activeChat = useAppSelector(selectActiveChat) as ActiveChat;
  const editedMessageData = useAppSelector(selectMessageDataForRender) as MessageDataForRender;

  const { setActiveServiceMethod } = useActions();

  const { t } = useTranslation();

  const [editMessage, { isLoading: isEditMessageLoading }] = useEditMessageMutation();

  const [form] = useFormWithLanguageValidation<ChatFormValues>();
  const responseTimerReference = useRef<number | null>(null);

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const onEditMessage = async (values: ChatFormValues) => {
    const { message } = values;

    const body = {
      ...instanceCredentials,
      chatId: activeChat.chatId,
      idMessage: editedMessageData.idMessage,
      message,
    };

    if (responseTimerReference.current) {
      clearTimeout(responseTimerReference.current);

      responseTimerReference.current = null;
    }

    form.setFields([{ name: 'response', errors: [], warnings: [] }]);

    const { data, error } = await editMessage(body);

    if (error && 'status' in error && error.status === 466) {
      form.setFields([{ name: 'response', errors: [t('QUOTE_EXCEEDED')] }]);

      return;
    }

    if (data) {
      form.resetFields();

      responseTimerReference.current = setTimeout(() => {
        form.setFields([{ name: 'response', errors: [], warnings: [] }]);
      }, 5000);

      setActiveServiceMethod(null);
    }
  };

  return (
    <Form
      name="edit-message-form"
      className="chat-form relative bg-color-second"
      onFinish={onEditMessage}
      onSubmitCapture={() => form.setFields([{ name: 'response', errors: [], warnings: [] }])}
      form={form}
      onKeyDown={(e) => !e.ctrlKey && e.key === 'Enter' && form.submit()}
      disabled={isEditMessageLoading}
      style={{ borderRadius: 8 }}
    >
      <Form.Item style={{ marginBottom: 0 }} name="response" className="response-form-item">
        <Row gutter={[15, 15]} align={'middle'}>
          <Col flex="auto">
            <Form.Item
              style={{ marginBottom: 0 }}
              name="message"
              rules={[{ required: true, message: t('EMPTY_FIELD_ERROR') }]}
              normalize={(value) => {
                form.setFields([{ name: 'response', warnings: [] }]);

                return value;
              }}
            >
              <TextArea ref={textAreaRef} />
            </Form.Item>
          </Col>
          <Col>
            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="link"
                htmlType="submit"
                size="large"
                className="login-form-button"
                loading={isEditMessageLoading}
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

export default EditMessageForm;
