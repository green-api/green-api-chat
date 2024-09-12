import { FC } from 'react';

import { Button, Form, Input } from 'antd';
import { useTranslation } from 'react-i18next';

import { formItemMethodApiLayout } from 'configs';
import { useActions, useAppDispatch, useAppSelector, useFormWithLanguageValidation } from 'hooks';
import { useSendContactMutation } from 'services/green-api/endpoints';
import { journalsGreenApiEndpoints } from 'services/green-api/endpoints/journals.green-api.endpoints';
import { selectActiveChat, selectMessageCount } from 'store/slices/chat.slice';
import { selectCredentials } from 'store/slices/user.slice';
import { ActiveChat, SendContactFormValues } from 'types';
import { getErrorMessage, isApiError } from 'utils';

const SendContactForm: FC = () => {
  const userCredentials = useAppSelector(selectCredentials);
  const activeChat = useAppSelector(selectActiveChat) as ActiveChat;
  const messageCount = useAppSelector(selectMessageCount);

  const dispatch = useAppDispatch();
  const { setActiveSendingMode } = useActions();

  const { t } = useTranslation();

  const [sendContact, { isLoading }] = useSendContactMutation();

  const [form] = useFormWithLanguageValidation<SendContactFormValues>();

  const onFinish = async (values: SendContactFormValues) => {
    const body = {
      ...userCredentials,
      chatId: activeChat.chatId,
      contact: values,
    };

    form.setFields([{ name: 'response', errors: [], warnings: [] }]);

    const { data, error } = await sendContact(body);

    if (isApiError(error)) {
      switch (error.status) {
        case 466:
          return form.setFields([{ name: 'response', errors: [t('QUOTE_EXCEEDED')] }]);

        default:
          return form.setFields([
            { name: 'response', errors: [getErrorMessage(error, t) || t('UNKNOWN_ERROR')] },
          ]);
      }
    }

    if (data) {
      const updateChatHistoryThunk = journalsGreenApiEndpoints.util?.updateQueryData(
        'getChatHistory',
        {
          idInstance: userCredentials.idInstance,
          apiTokenInstance: userCredentials.apiTokenInstance,
          chatId: activeChat.chatId,
          count: messageCount,
        },
        (draftChatHistory) => {
          const existingMessage = draftChatHistory.find((msg) => msg.idMessage === data.idMessage);
          if (existingMessage) {
            console.log('message already in chat history');

            return;
          }

          draftChatHistory.push({
            type: 'outgoing',
            typeMessage: 'contactMessage',
            contact: {
              displayName: `${values.firstName || ''} ${values.middleName || ''} ${values.lastName || ''}`,
              vcard: '',
            },
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

      setActiveSendingMode(null);
    }
  };

  return (
    <Form form={form} {...formItemMethodApiLayout} onFinish={onFinish}>
      <Form.Item
        name="phoneContact"
        label={t('CONTACT_PHONE_LABEL')}
        rules={[
          { required: true, message: t('EMPTY_FIELD_ERROR') },
          { min: 9, message: t('CONTACT_PHONE_INVALID_MESSAGE') },
        ]}
        normalize={(value: string) => value.replaceAll(/\D/g, '')}
      >
        <Input type="tel" placeholder={t('CONTACT_PHONE_LABEL')} />
      </Form.Item>
      <Form.Item name="firstName" label={t('NAME_LABEL')}>
        <Input placeholder={t('NAME_LABEL')} />
      </Form.Item>
      <Form.Item name="lastName" label={t('LASTNAME_LABEL')}>
        <Input placeholder={t('LASTNAME_LABEL')} />
      </Form.Item>
      <Form.Item name="middleName" label={t('MIDDLENAME_LABEL')}>
        <Input placeholder={t('MIDDLENAME_LABEL')} />
      </Form.Item>
      <Form.Item name="company" label={t('COMPANY_LABEL')}>
        <Input placeholder={t('COMPANY_LABEL')} />
      </Form.Item>
      <Form.Item name="quotedMessageId" label={t('QUOTED_MESSAGE_ID_LABEL')}>
        <Input placeholder={t('QUOTED_MESSAGE_ID_LABEL')} />
      </Form.Item>
      <Form.Item
        style={{ marginBottom: 0 }}
        wrapperCol={{
          span: 24,
          offset: 0,
          sm: {
            span: 20,
            offset: 4,
          },
          lg: {
            span: 16,
            offset: 8,
          },
        }}
      >
        <Button disabled={isLoading} htmlType="submit" size="large" block={true} type="primary">
          {t('SEND_MESSAGE')}
        </Button>
      </Form.Item>
      <Form.Item style={{ marginBottom: 0 }} name="response" className="response-form-item" />
    </Form>
  );
};

export default SendContactForm;
