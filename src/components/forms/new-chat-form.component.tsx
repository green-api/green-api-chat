import { FC, useRef } from 'react';

import { LoadingOutlined, SendOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, Row } from 'antd';
import { useTranslation } from 'react-i18next';

import TextArea from 'components/UI/text-area.component';
import { useAppDispatch, useAppSelector, useFormWithLanguageValidation } from 'hooks';
import { useCheckWhatsappMutation, useSendMessageMutation } from 'services/green-api/endpoints';
import { journalsGreenApiEndpoints } from 'services/green-api/endpoints/journals.green-api.endpoints';
import { selectMiniVersion } from 'store/slices/chat.slice';
import { selectInstance } from 'store/slices/instances.slice';
import { selectUser } from 'store/slices/user.slice';
import { MessageInterface, NewChatFormValues } from 'types';
import { getLastChats, isAuth } from 'utils';

interface NewChatFormProps {
  onSubmitCallback?: () => void;
}

const NewChatForm: FC<NewChatFormProps> = ({ onSubmitCallback }) => {
  const instanceCredentials = useAppSelector(selectInstance);
  const user = useAppSelector(selectUser);
  const isMiniVersion = useAppSelector(selectMiniVersion);

  const dispatch = useAppDispatch();

  const { t } = useTranslation();

  const [sendMessage, { isLoading }] = useSendMessageMutation();
  const [checkWhatsapp] = useCheckWhatsappMutation();

  const [form] = useFormWithLanguageValidation<NewChatFormValues>();
  const responseTimerReference = useRef<number | null>(null);

  const onSendMessage = async (values: NewChatFormValues) => {
    if (!isAuth(user)) return;

    const { message, chatId } = values;

    if (responseTimerReference.current) {
      clearTimeout(responseTimerReference.current);

      responseTimerReference.current = null;
    }

    form.setFields([
      { name: 'response', errors: [], warnings: [] },
      { name: 'chatId', errors: [], warnings: [] },
    ]);

    const isGroupChat = /\d{17}/.test(chatId);
    const fullChatId = isGroupChat ? `${chatId}@g.us` : `${chatId}@c.us`;

    let addNewChatInList = !isGroupChat;

    if (!isGroupChat) {
      const { data, error } = await checkWhatsapp({
        idInstance: instanceCredentials.idInstance,
        apiTokenInstance: instanceCredentials.apiTokenInstance,
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
      idInstance: instanceCredentials.idInstance,
      apiTokenInstance: instanceCredentials.apiTokenInstance,
      chatId: fullChatId,
      refetchLastMessages: !addNewChatInList,
      message,
    };

    const { data, error } = await sendMessage(body);

    if (error && 'status' in error && error.status === 466) {
      form.setFields([{ name: 'response', errors: [t('QUOTE_EXCEEDED')] }]);

      return;
    }

    if (data) {
      if (addNewChatInList) {
        const updateChatHistoryThunk = journalsGreenApiEndpoints.util?.updateQueryData(
          'lastMessages',
          {
            idInstance: instanceCredentials.idInstance,
            apiTokenInstance: instanceCredentials.apiTokenInstance,
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

            return getLastChats(draftChatHistory, [newMessage], isMiniVersion ? 5 : undefined);
          }
        );

        dispatch(updateChatHistoryThunk);
      }

      form.resetFields();

      form.setFields([{ name: 'response', warnings: [t('SUCCESS_SENDING_MESSAGE')] }]);

      if (onSubmitCallback) {
        onSubmitCallback();
      }

      responseTimerReference.current = setTimeout(() => {
        form.setFields([{ name: 'response', errors: [], warnings: [] }]);
      }, 5000);
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
              <TextArea />
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
