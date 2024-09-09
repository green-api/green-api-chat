import { FC } from 'react';

import { LoadingOutlined, SendOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, Row } from 'antd';
import { useTranslation } from 'react-i18next';

import { useAppDispatch, useAppSelector, useFormWithLanguageValidation } from 'hooks';
import { useCheckWhatsappMutation, useSendMessageMutation } from 'services/green-api/endpoints';
import { journalsGreenApiEndpoints } from 'services/green-api/endpoints/journals.green-api.endpoints';
import { selectAuth, selectCredentials } from 'store/slices/user.slice';
import { MessageInterface, NewChatFormValues } from 'types';
import { getLastChats } from 'utils';

interface NewChatFormProps {
  onSubmitCallback?: () => void;
}

const NewChatForm: FC<NewChatFormProps> = ({ onSubmitCallback }) => {
  const userCredentials = useAppSelector(selectCredentials);
  const isAuth = useAppSelector(selectAuth);

  const dispatch = useAppDispatch();

  const { t } = useTranslation();

  const [sendMessage, { isLoading }] = useSendMessageMutation();
  const [checkWhatsapp] = useCheckWhatsappMutation();

  const [form] = useFormWithLanguageValidation<NewChatFormValues>();

  const onSendMessage = async (values: NewChatFormValues) => {
    if (!isAuth) return;

    const { message, chatId } = values;

    form.setFields([
      { name: 'response', errors: [], warnings: [] },
      { name: 'chatId', errors: [], warnings: [] },
    ]);

    const isGroupChat = /\d{17}/.test(chatId);
    const fullChatId = isGroupChat ? `${chatId}@g.us` : `${chatId}@c.us`;

    let addNewChatInList = true;

    if (!isGroupChat) {
      const { data, error } = await checkWhatsapp({
        idInstance: userCredentials.idInstance,
        apiTokenInstance: userCredentials.apiTokenInstance,
        phoneNumber: chatId,
      });

      if (error && 'status' in error && error.status === 466) {
        form.setFields([{ name: 'chatId', errors: [t('CHECK_WHATSAPP_QUOTE_REACHED')] }]);

        addNewChatInList = false;
      }

      if (data && !data.existsWhatsapp) {
        return form.setFields([{ name: 'chatId', errors: [t('PHONE_DOES_NOT_HAVE_WHATSAPP')] }]);
      }
    }

    const body = {
      idInstance: userCredentials.idInstance,
      apiTokenInstance: userCredentials.apiTokenInstance,
      chatId: fullChatId,
      refetchLastMessages: !addNewChatInList,
      message,
    };

    const { data, error } = await sendMessage(body);

    if (error && 'status' in error && error.status === 466) {
      form.setFields([{ name: 'response', errors: [t('QUOTE_EXCEEDED')] }]);

      return;
    }

    form.setFieldValue('message', '');

    if (data) {
      if (addNewChatInList) {
        const updateChatHistoryThunk = journalsGreenApiEndpoints.util?.updateQueryData(
          'lastMessages',
          {
            idInstance: userCredentials.idInstance,
            apiTokenInstance: userCredentials.apiTokenInstance,
          },
          (draftChatHistory) => {
            const newMessage: MessageInterface = {
              type: 'outgoing',
              typeMessage: 'textMessage',
              textMessage: message,
              timestamp: Math.floor(Date.now() / 1000),
              senderName: '',
              senderContactName: '',
              idMessage: data.idMessage,
              chatId: fullChatId,
              statusMessage: 'sent',
            };

            return getLastChats(draftChatHistory, [newMessage], 5);
          }
        );

        dispatch(updateChatHistoryThunk);
      }

      form.setFields([{ name: 'response', warnings: [t('SUCCESS_SENDING_MESSAGE')] }]);

      if (onSubmitCallback) {
        onSubmitCallback();
      }
    }
  };

  return (
    <Form
      name="new-chat-form"
      className="chat-form"
      onFinish={onSendMessage}
      form={form}
      onSubmitCapture={() => form.setFields([{ name: 'response', errors: [], warnings: [] }])}
    >
      <Form.Item
        name="chatId"
        normalize={(value: string) => {
          form.setFields([{ name: 'response', warnings: [] }]);

          return value.replaceAll(/[^\d-]/g, '');
        }}
        rules={[
          { required: true, message: t('EMPTY_FIELD_ERROR') },
          { min: 9, message: t('CHAT_ID_INVALID_VALUE_MESSAGE') },
        ]}
        validateDebounce={800}
        required
      >
        <Input
          disabled={!isAuth}
          autoComplete="off"
          type="tel"
          placeholder={t('CHAT_ID_PLACEHOLDER')}
        />
      </Form.Item>
      <Form.Item style={{ marginBottom: 0 }} name="response" className="response-form-item">
        <Row gutter={[15, 15]} align="bottom">
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
              <Input.TextArea
                autoSize={{ minRows: 5, maxRows: 5 }}
                maxLength={500}
                placeholder={t('MESSAGE_PLACEHOLDER')}
                disabled={!isAuth}
              />
            </Form.Item>
          </Col>
          <Col>
            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                disabled={!isAuth}
                type="link"
                htmlType="submit"
                size="large"
                className="login-form-button"
              >
                {isLoading ? <LoadingOutlined /> : <SendOutlined />}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form.Item>
    </Form>
  );
};

export default NewChatForm;
