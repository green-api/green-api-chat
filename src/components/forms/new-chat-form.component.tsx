import { FC, useRef } from 'react';

import { LoadingOutlined, SendOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, Row, Select } from 'antd';
import { useTranslation } from 'react-i18next';

import ChatIdInput from 'components/UI/chat-id-input.component';
import TextArea from 'components/UI/text-area.component';
import { useAppDispatch, useAppSelector, useAppStore, useFormWithLanguageValidation } from 'hooks';
import { useIsMaxInstance } from 'hooks/use-is-max-instance';
import { useIsTelegramInstance } from 'hooks/use-is-telegram-instance';
import {
  useCheckAccountMutation,
  useCheckWhatsappMutation,
  useSendMessageMutation,
} from 'services/green-api/endpoints';
import { serviceMethodsGreenApiEndpoints } from 'services/green-api/endpoints/service-methods.green-api.endpoints';
import { selectMiniVersion, selectType } from 'store/slices/chat.slice';
import { selectInstance, selectIsChatWorking } from 'store/slices/instances.slice';
import { selectUser } from 'store/slices/user.slice';
import { GetChatsParametersInterface, GetChatsResponseInterface, NewChatFormValues } from 'types';
import { getPhoneNumberFromChatId, isAuth } from 'utils';
import { isLidChatId, splitChatId } from 'utils/chat-id.utils';

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
  const store = useAppStore();

  const { t } = useTranslation();

  const [sendMessage, { isLoading }] = useSendMessageMutation();
  const [checkWhatsapp] = useCheckWhatsappMutation();
  const [checkAccount] = useCheckAccountMutation();

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

    const isGroupChat = isMaxOrTelegram
      ? chatIdType === 'chatId'
        ? chatId.startsWith('-') || chatId.length === 17 || chatId.length === 18
        : /\d{17}/.test(chatId)
      : chatId.endsWith('@g.us');

    let resolvedChatId = chatId;

    let addNewChatInList = !isGroupChat;

    const shouldCheckWhatsapp = !isMaxOrTelegram && resolvedChatId.endsWith('@c.us');

    if (shouldCheckWhatsapp) {
      const [phoneNumber] = splitChatId(resolvedChatId);
      const { data, error } = await checkWhatsapp({
        ...instanceCredentials,
        phoneNumber,
      });

      if (error && 'status' in error && error.status === 466) {
        form.setFields([{ name: 'chatId', errors: [t('CHECK_WHATSAPP_QUOTE_REACHED')] }]);

        addNewChatInList = false;
      }

      if (data && !data.existsWhatsapp) {
        return form.setFields([{ name: 'chatId', errors: [t('PHONE_DOES_NOT_HAVE_WHATSAPP')] }]);
      }
    }

    const shouldCheckAccount = isMaxOrTelegram && chatIdType === 'phone' && !isGroupChat;

    if (shouldCheckAccount) {
      const { data, error } = await checkAccount({
        ...instanceCredentials,
        phoneNumber: chatId,
      });

      if (error && 'status' in error && error.status === 466) {
        form.setFields([{ name: 'chatId', errors: [t('CHECK_ACCOUNT_QUOTE_REACHED')] }]);

        addNewChatInList = false;
      }

      if (data && !data.exist) {
        return form.setFields([{ name: 'chatId', errors: [t('ACCOUNT_NOT_FOUND')] }]);
      }

      if (data?.exist) {
        resolvedChatId = data.chatId;
      }
    }

    const body = {
      ...instanceCredentials,
      chatId: resolvedChatId,
      message,
    };

    const { data, error } = await sendMessage(body);

    if (error && 'status' in error && error.status === 466) {
      form.setFields([{ name: 'response', errors: [t('QUOTE_EXCEEDED')] }]);

      return;
    }

    if (data) {
      if (addNewChatInList) {
        serviceMethodsGreenApiEndpoints.util
          .selectInvalidatedBy(store.getState(), ['chats'])
          .filter(
            (entry) =>
              entry.endpointName === 'getChats' &&
              (entry.originalArgs as GetChatsParametersInterface).idInstance ===
                instanceCredentials.idInstance
          )
          .forEach(({ originalArgs }) =>
            dispatch(
              serviceMethodsGreenApiEndpoints.util.updateQueryData(
                'getChats',
                originalArgs as GetChatsParametersInterface,
                (draft) => {
                  const alreadyExists = draft.some((chat) => chat.chatId === resolvedChatId);

                  if (alreadyExists) return;

                  const newChat: GetChatsResponseInterface = {
                    chatId: resolvedChatId,
                    name: getPhoneNumberFromChatId(resolvedChatId) || resolvedChatId,
                    type: isGroupChat ? 'group' : 'user',
                    ...(isGroupChat
                      ? {}
                      : { phoneNumber: getPhoneNumberFromChatId(resolvedChatId) }),
                  };

                  draft.unshift(newChat);
                }
              )
            )
          );
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
        <Form.Item name="chatIdType" initialValue="chatId" style={{ marginBottom: 12 }}>
          <Select style={{ width: '100%' }}>
            <Select.Option value="phone">{t('PHONE_NUMBER', 'Номер телефона')}</Select.Option>
            <Select.Option value="chatId">
              {t('CONTACT_CHAT_ID_LABEL', 'Идентификатор чата')}
            </Select.Option>
          </Select>
        </Form.Item>
      )}
      <Form.Item
        noStyle
        shouldUpdate={(prevValues, currentValues) =>
          prevValues.chatIdType !== currentValues.chatIdType
        }
      >
        {({ getFieldValue }) => {
          const selectedType =
            getFieldValue('chatIdType') || (isMaxOrTelegram ? 'chatId' : 'phone');
          const isPhoneRuleNeeded = !isMaxOrTelegram || selectedType === 'phone';
          const minChatIdLength = isMaxOrTelegram ? 6 : 9;

          return (
            <Form.Item
              name="chatId"
              normalize={(value: string) => {
                form.setFields([{ name: 'response', warnings: [] }]);
                if (!isMaxOrTelegram) return value;
                const regex = selectedType === 'chatId' ? /[^\d-]/g : /\D/g;
                return value.replaceAll(regex, '');
              }}
              rules={[
                { required: true, message: t('EMPTY_FIELD_ERROR') },
                {
                  validator: (_, value: string) => {
                    if (!value) return Promise.resolve();
                    if (!isMaxOrTelegram) {
                      const [identifier] = splitChatId(value);
                      const minLength = isLidChatId(value) ? 3 : 9;
                      return identifier.length >= minLength
                        ? Promise.resolve()
                        : Promise.reject(new Error(t('CHAT_ID_INVALID_VALUE_MESSAGE')));
                    }
                    if (isPhoneRuleNeeded && value.length < minChatIdLength) {
                      return Promise.reject(new Error(t('CHAT_ID_INVALID_VALUE_MESSAGE')));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
              validateDebounce={800}
              required
            >
              {isMaxOrTelegram ? (
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
              ) : (
                <ChatIdInput disabled={!isAuth} autoComplete="off" />
              )}
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
