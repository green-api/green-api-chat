import { FC } from 'react';

import { Button, Form, Input } from 'antd';
import { useTranslation } from 'react-i18next';

import { formItemMethodApiLayout } from 'configs';
import { useActions, useAppSelector, useFormWithLanguageValidation } from 'hooks';
import { useIsMaxInstance } from 'hooks/use-is-max-instance';
import { useIsTelegramInstance } from 'hooks/use-is-telegram-instance';
import { useSendContactMutation } from 'services/green-api/endpoints';
import { selectActiveChat } from 'store/slices/chat.slice';
import { selectInstance } from 'store/slices/instances.slice';
import { ActiveChat, SendContactFormValues } from 'types';
import { getErrorMessage, isApiError } from 'utils';

const SendContactForm: FC = () => {
  const instanceCredentials = useAppSelector(selectInstance);
  const activeChat = useAppSelector(selectActiveChat) as ActiveChat;

  const { setActiveSendingMode } = useActions();

  const { t } = useTranslation();

  const isMax = useIsMaxInstance();
  const isTelegram = useIsTelegramInstance();
  const contactInputLabel = isMax ? t('CONTACT_CHAT_ID_LABEL') : t('CONTACT_PHONE_LABEL');

  const [sendContact, { isLoading }] = useSendContactMutation();

  const [form] = useFormWithLanguageValidation<SendContactFormValues>();

  const onFinish = async (values: SendContactFormValues) => {
    const contact = isTelegram
      ? {
          phoneContact: Number.parseInt(values.phoneContact, 10),
          firstName: values.firstName ?? '',
          ...(values.lastName ? { lastName: values.lastName } : {}),
          ...(values.company ? { company: values.company } : {}),
        }
      : isMax
        ? {
            chatId: values.phoneContact,
          }
        : {
            phoneContact: values.phoneContact,
            ...(values.firstName ? { firstName: values.firstName } : {}),
            ...(values.lastName ? { lastName: values.lastName } : {}),
            ...(values.middleName ? { middleName: values.middleName } : {}),
            ...(values.company ? { company: values.company } : {}),
          };

    const body = {
      ...instanceCredentials,
      chatId: activeChat.chatId,
      contact,
      ...(!isTelegram && !isMax && values.quotedMessageId
        ? { quotedMessageId: values.quotedMessageId }
        : {}),
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
      form.setFields([{ name: 'response', warnings: [t('SUCCESS_SENDING_MESSAGE')] }]);

      setActiveSendingMode(null);
    }
  };

  return (
    <Form form={form} {...formItemMethodApiLayout} onFinish={onFinish}>
      <Form.Item
        name="phoneContact"
        label={contactInputLabel}
        rules={[
          { required: true, message: t('EMPTY_FIELD_ERROR') },
          {
            min: isMax ? 6 : 9,
            message: t('CONTACT_PHONE_INVALID_MESSAGE'),
          },
        ]}
        normalize={(value: string) => value.replaceAll(/\D/g, '')}
      >
        <Input type="tel" placeholder={contactInputLabel} />
      </Form.Item>
      {!isMax && (
        <Form.Item
          name="firstName"
          label={t('NAME_LABEL')}
          rules={isTelegram ? [{ required: true, message: t('EMPTY_FIELD_ERROR') }] : undefined}
        >
          <Input placeholder={t('NAME_LABEL')} />
        </Form.Item>
      )}
      {!isMax && (
        <Form.Item name="lastName" label={t('LASTNAME_LABEL')}>
          <Input placeholder={t('LASTNAME_LABEL')} />
        </Form.Item>
      )}
      {!isTelegram && !isMax && (
        <Form.Item name="middleName" label={t('MIDDLENAME_LABEL')}>
          <Input placeholder={t('MIDDLENAME_LABEL')} />
        </Form.Item>
      )}
      {!isMax && (
        <Form.Item name="company" label={t('COMPANY_LABEL')}>
          <Input placeholder={t('COMPANY_LABEL')} />
        </Form.Item>
      )}
      {!isTelegram && !isMax && (
        <Form.Item name="quotedMessageId" label={t('QUOTED_MESSAGE_ID_LABEL')}>
          <Input placeholder={t('QUOTED_MESSAGE_ID_LABEL')} />
        </Form.Item>
      )}
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
            offset: 9,
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
