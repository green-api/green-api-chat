import { FC, useRef } from 'react';

import { LoadingOutlined, SendOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, Row, Select } from 'antd';
import { useTranslation } from 'react-i18next';

import TextArea from 'components/UI/text-area.component';
import { useAppDispatch, useAppSelector, useFormWithLanguageValidation } from 'hooks';
import { useIsMaxInstance } from 'hooks/use-is-max-instance';
import { useIsTelegramInstance } from 'hooks/use-is-telegram-instance';
import { useCheckWhatsappMutation, useSendMessageMutation } from 'services/green-api/endpoints';
import { journalsGreenApiEndpoints } from 'services/green-api/endpoints/journals.green-api.endpoints';
import { selectMiniVersion, selectType } from 'store/slices/chat.slice';
import { selectInstance, selectIsChatWorking } from 'store/slices/instances.slice';
import { selectUser } from 'store/slices/user.slice';
import { MessageInterface, NewChatFormValues } from 'types';
import { isAuth, updateAllChats } from 'utils';

interface NewChatFormProps {
  onSubmitCallback?: () => void;
}

const NewChatForm: FC<NewChatFormProps> = ({ onSubmitCallback }) => {
  const instanceCredentials = useAppSelector(selectInstance);
  const user = useAppSelector(selectUser);
  const isMiniVersion = useAppSelector(selectMiniVersion);
  const isChatWorking = useAppSelector(selectIsChatWorking);
  const type = useAppSelector(selectType);
  const isMax = useIsMaxInstance();
  const isTelegram = useIsTelegramInstance();
  const isMaxOrTelegram = isMax || isTelegram;

  const dispatch = useAppDispatch();

  const { t } = useTranslation();

  const [sendMessage, { isLoading }] = useSendMessageMutation();
  const [checkWhatsapp] = useCheckWhatsappMutation();

  const [form] = useFormWithLanguageValidation<NewChatFormValues>();
  const responseTimerReference = useRef<number | null>(null);

  const standaloneChatTypes = ['partner-iframe', 'one-chat-only'];

  const onSendMessage = async (values: NewChatFormValues) => {
    if (!isAuth(user) && !standaloneChatTypes.includes(type) && isChatWorking === false) return;

    const { message, chatId, chatIdType } = values;

    if (responseTimerReference.current) {
      clearTimeout(responseTimerReference.current);

      responseTimerReference.current = null;
    }

    form.setFields([
      { name: 'response', errors: [], warnings: [] },
      { name: 'chatId', errors: [], warnings: [] },
    ]);

    const isGroupChat =
      chatIdType === 'chatId'
        ? (chatId.startsWith('-') || chatId.length === 17 || chatId.length === 18)
        : (/\d{17}/.test(chatId));

    const fullChatId =
      chatId.includes('@')
        ? chatId
        : chatIdType === 'chatId'
          ? (chatId.startsWith('-') ? chatId : (chatId.length === 17 || chatId.length === 18 ? `${chatId}@g.us` : chatId))
          : chatIdType === 'phone'
            ? `${chatId}@c.us`
            : isGroupChat
              ? `${chatId}@g.us`
              : `${chatId}@c.us`;

    let addNewChatInList = !isGroupChat;

    const shouldCheckWhatsapp =
      !isGroupChat &&
      !isMaxOrTelegram &&
      (!chatIdType || chatIdType === 'phone');

    if (shouldCheckWhatsapp) {
      const { data, error } = await checkWhatsapp({
        ...instanceCredentials,
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
      ...instanceCredentials,
      chatId: fullChatId,
      message,
    };

    const { data, error } = await sendMessage(body);

    if (error && 'status' in error && error.status === 466) {
      form.setFields([{ name: 'response', errors: [t('QUOTE_EXCEEDED')] }]);

      return;
    }

    if (data) {
      if (addNewChatInList) {
        const updateChatListThunk = journalsGreenApiEndpoints.util?.updateQueryData(
          'lastMessages',
          { allMessages: true, ...instanceCredentials },
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

            return updateAllChats(draftChatHistory, [newMessage], []);
          }
        );
        dispatch(updateChatListThunk);
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
      onKeyDown={(e) => !e.ctrlKey && e.key === 'Enter' && form.submit()}
    >
      {isMaxOrTelegram && (
        <Form.Item name="chatIdType" initialValue="phone" style={{ marginBottom: 12 }}>
          <Select style={{ width: '100%' }}>
            <Select.Option value="phone">{t('PHONE_NUMBER', 'Номер телефона')}</Select.Option>
            <Select.Option value="chatId">{t('CONTACT_CHAT_ID_LABEL', 'Идентификатор чата')}</Select.Option>
          </Select>
        </Form.Item>
      )}
      <Form.Item
        noStyle
        shouldUpdate={(prevValues, currentValues) => prevValues.chatIdType !== currentValues.chatIdType}
      >
        {({ getFieldValue }) => {
          const selectedType = getFieldValue('chatIdType') || 'phone';
          const isPhoneRuleNeeded = !isMaxOrTelegram || selectedType === 'phone';

          return (
            <Form.Item
              name="chatId"
              normalize={(value: string) => {
                form.setFields([{ name: 'response', warnings: [] }]);
                const regex = selectedType === 'chatId' ? /[^\d-]/g : /\D/g;
                return value.replaceAll(regex, '');
              }}
              rules={[
                { required: true, message: t('EMPTY_FIELD_ERROR') },
                ...(isPhoneRuleNeeded ? [{ min: 9, message: t('CHAT_ID_INVALID_VALUE_MESSAGE') }] : []),
              ]}
              validateDebounce={800}
              required
            >
              <Input
                disabled={!isAuth}
                autoComplete="off"
                type="tel"
                placeholder={
                  selectedType === 'phone'
                    ? t('CHAT_ID_PHONE_PLACEHOLDER', 'Номер телефона')
                    : t('CONTACT_CHAT_ID_LABEL', 'Идентификатор чата')
                }
              />
            </Form.Item>
          );
        }}
      </Form.Item>
      <Form.Item style={{ marginBottom: 0 }} name="response" className="response-form-item">
        <Row gutter={[15, 15]} align={isMiniVersion ? 'bottom' : 'middle'}>
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
                disabled={!isAuth || isChatWorking === false}
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
