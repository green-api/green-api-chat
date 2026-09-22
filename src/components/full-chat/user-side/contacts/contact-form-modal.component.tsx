import { FC, useCallback, useEffect } from 'react';

import { Form, Input, message, Modal, Select } from 'antd';
import { useTranslation } from 'react-i18next';

import { ContactFormValues, getContactApiErrorDetails, normalizeChatId } from './contacts.helpers';
import ChatIdInput from 'components/UI/chat-id-input.component';
import { useActions, useAppSelector, useFormWithLanguageValidation } from 'hooks';
import { useIsMaxInstance } from 'hooks/use-is-max-instance';
import { useIsTelegramInstance } from 'hooks/use-is-telegram-instance';
import {
  useAddContactMutation,
  useCheckAccountMutation,
  useCheckWhatsappMutation,
  useEditContactMutation,
  useLazyGetContactInfoQuery,
} from 'services/green-api/endpoints';
import { selectEditedContact, selectIsContactModalOpen } from 'store/slices/contacts-modal.slice';
import { selectInstance } from 'store/slices/instances.slice';
import { getPhoneNumberFromChatId } from 'utils';
import { ensureChatIdSuffix, isLidChatId, splitChatId } from 'utils/chat-id.utils';

const MAX_CHAT_ID_MIN_LENGTH = 6;

const ContactFormModal: FC = () => {
  const { t } = useTranslation();

  const instanceCredentials = useAppSelector(selectInstance);
  const isOpen = useAppSelector(selectIsContactModalOpen);
  const editedContact = useAppSelector(selectEditedContact);
  const isEditMode = !!editedContact;
  const isMax = useIsMaxInstance();
  const isTelegram = useIsTelegramInstance();
  const isMaxOrTelegram = isMax || isTelegram;

  const { closeContactModal } = useActions();

  const [form] = useFormWithLanguageValidation<ContactFormValues>();

  const [checkWhatsapp] = useCheckWhatsappMutation();
  const [checkAccount] = useCheckAccountMutation();
  const [getContactInfo] = useLazyGetContactInfoQuery();
  const [addContact, { isLoading: isAddContactLoading }] = useAddContactMutation();
  const [editContact, { isLoading: isEditContactLoading }] = useEditContactMutation();

  const isLoading = isAddContactLoading || isEditContactLoading;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (editedContact) {
      form.setFieldsValue({
        chatId: String((isMaxOrTelegram && editedContact.phoneNumber) || editedContact.id),
        contactName: editedContact.contactName || editedContact.name || '',
        contactSecondName: '',
      });

      return;
    }

    form.resetFields();
  }, [editedContact, form, isOpen, isMaxOrTelegram]);

  const closeModal = useCallback(() => {
    closeContactModal();
    form.resetFields();
  }, [closeContactModal, form]);

  const clearFormErrors = () => {
    form.setFields([
      { name: 'chatId', errors: [] },
      { name: 'contactName', errors: [] },
      { name: 'contactSecondName', errors: [] },
    ]);
  };

  const validateWhatsappAvailability = async (chatId: string): Promise<boolean> => {
    if (isLidChatId(chatId)) return true;

    const phoneNumber = getPhoneNumberFromChatId(chatId).replace(/\D/g, '');

    if (!phoneNumber) {
      form.setFields([{ name: 'chatId', errors: [t('CONTACT_PHONE_INVALID_MESSAGE')] }]);

      return false;
    }

    const { data, error } = await checkWhatsapp({
      ...instanceCredentials,
      phoneNumber,
    });

    if (error) {
      const errorDetails = getContactApiErrorDetails(error, t);

      if (errorDetails.field) {
        form.setFields([{ name: errorDetails.field, errors: [errorDetails.message] }]);
      } else {
        message.error(errorDetails.message);
      }

      return false;
    }

    if (!data?.existsWhatsapp) {
      form.setFields([{ name: 'chatId', errors: [t('PHONE_DOES_NOT_HAVE_WHATSAPP')] }]);

      return false;
    }

    return true;
  };

  const validateAccountAvailability = async (
    chatId: string
  ): Promise<{ isAvailable: boolean; resolvedChatId?: string }> => {
    const { data, error } = await checkAccount({
      ...instanceCredentials,
      phoneNumber: chatId,
    });

    if (error) {
      const errorDetails = getContactApiErrorDetails(error, t);

      if (errorDetails.field) {
        form.setFields([{ name: errorDetails.field, errors: [errorDetails.message] }]);
      } else {
        message.error(errorDetails.message);
      }

      return { isAvailable: false };
    }

    if (!data?.exist) {
      form.setFields([
        { name: 'chatId', errors: [t(isMax ? 'MAX_ACCOUNT_NOT_FOUND' : 'ACCOUNT_NOT_FOUND')] },
      ]);

      return { isAvailable: false };
    }

    return { isAvailable: true, resolvedChatId: data.chatId };
  };

  const validateChatIdAvailability = async (chatId: string): Promise<boolean> => {
    const { data, error } = await getContactInfo({
      ...instanceCredentials,
      chatId,
    });

    if (error) {
      const errorDetails = getContactApiErrorDetails(error, t);

      if (errorDetails.field) {
        form.setFields([{ name: errorDetails.field, errors: [errorDetails.message] }]);
      } else {
        message.error(errorDetails.message);
      }

      return false;
    }

    const isEmptyContact = !data?.lastSeen && !data?.phoneNumber && !data?.phoneNumberTimestamp;

    if (isEmptyContact) {
      form.setFields([
        { name: 'chatId', errors: [t(isMax ? 'MAX_ACCOUNT_NOT_FOUND' : 'ACCOUNT_NOT_FOUND')] },
      ]);

      return false;
    }

    return true;
  };

  const handleSubmit = async (values: ContactFormValues) => {
    clearFormErrors();

    const normalizedChatId = normalizeChatId(values.chatId, isMaxOrTelegram);

    if (!normalizedChatId || (!isMaxOrTelegram && normalizedChatId.includes('@g.us'))) {
      form.setFields([{ name: 'chatId', errors: [t('CONTACT_PHONE_INVALID_MESSAGE')] }]);

      return;
    }

    const isChatIdType = isEditMode
      ? isMaxOrTelegram && !editedContact?.phoneNumber
      : isMaxOrTelegram && values.chatIdType === 'chatId';

    let resolvedAccountChatId: string | undefined;

    if (!isEditMode) {
      if (isChatIdType) {
        const isAccountAvailable = await validateChatIdAvailability(normalizedChatId);

        if (!isAccountAvailable) {
          return;
        }
      } else if (isMaxOrTelegram) {
        const accountAvailability = await validateAccountAvailability(normalizedChatId);

        if (!accountAvailability.isAvailable) {
          return;
        }

        resolvedAccountChatId = accountAvailability.resolvedChatId;
      } else {
        const isAccountAvailable = await validateWhatsappAvailability(normalizedChatId);

        if (!isAccountAvailable) {
          return;
        }
      }
    }

    const finalChatId = isChatIdType
      ? normalizedChatId
      : isTelegram
        ? resolvedAccountChatId ?? normalizedChatId
        : isMax
          ? ensureChatIdSuffix(normalizedChatId)
          : normalizedChatId;

    const requestBody = {
      ...instanceCredentials,
      chatId: finalChatId,
      firstName: values.contactName.trim(),
      ...(values.contactSecondName?.trim() ? { lastName: values.contactSecondName.trim() } : {}),
      saveInAddressbook: isMaxOrTelegram ? undefined : true,
    };

    const response = isEditMode ? await editContact(requestBody) : await addContact(requestBody);

    if (response.error) {
      const errorDetails = getContactApiErrorDetails(response.error, t);

      if (errorDetails.field) {
        form.setFields([{ name: errorDetails.field, errors: [errorDetails.message] }]);
      } else {
        message.error(errorDetails.message);
      }

      return;
    }

    message.success(t(isEditMode ? 'CONTACT_UPDATED_SUCCESS' : 'CONTACT_CREATED_SUCCESS'));
    closeModal();
  };

  return (
    <Modal
      title={t(isEditMode ? 'EDIT_CONTACT' : 'ADD_CONTACT')}
      open={isOpen}
      onCancel={closeModal}
      onOk={() => form.submit()}
      okText={t(isEditMode ? 'SAVE_CONTACT_CHANGES' : 'ADD')}
      cancelText={t('CANCEL')}
      confirmLoading={isLoading}
      destroyOnClose
    >
      <Form<ContactFormValues> form={form} layout="vertical" onFinish={handleSubmit}>
        {isMaxOrTelegram && !isEditMode && (
          <Form.Item name="chatIdType" initialValue="phone" style={{ marginBottom: 12 }}>
            <Select style={{ width: '100%' }}>
              <Select.Option value="phone">{t('PHONE_NUMBER')}</Select.Option>
              <Select.Option value="chatId">{t('CONTACT_CHAT_ID_LABEL')}</Select.Option>
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
            const chatIdType = isMaxOrTelegram
              ? (getFieldValue('chatIdType') as ContactFormValues['chatIdType']) || 'phone'
              : undefined;
            const isPhoneRuleNeeded = !isMaxOrTelegram || isEditMode || chatIdType === 'phone';
            const isEditModeChatIdDisplay =
              isEditMode && isMaxOrTelegram && !editedContact?.phoneNumber;

            return (
              <Form.Item
                name="chatId"
                label={
                  isMaxOrTelegram &&
                  (isEditMode ? !isEditModeChatIdDisplay : chatIdType === 'phone')
                    ? t('PHONE_NUMBER')
                    : t('CONTACT_CHAT_ID_LABEL')
                }
                rules={[
                  { required: true, message: t('EMPTY_FIELD_ERROR') },
                  {
                    validator: (_, value) => {
                      const normalizedChatId = normalizeChatId(value ?? '', isMaxOrTelegram);

                      if (!normalizedChatId) {
                        return Promise.resolve();
                      }

                      if (isMaxOrTelegram) {
                        if (!isPhoneRuleNeeded) {
                          return Promise.resolve();
                        }

                        return normalizedChatId.length >= MAX_CHAT_ID_MIN_LENGTH
                          ? Promise.resolve()
                          : Promise.reject(new Error(t('CHAT_ID_INVALID_VALUE_MESSAGE')));
                      }

                      if (normalizedChatId.includes('@g.us')) {
                        return Promise.reject(new Error(t('CONTACT_PHONE_INVALID_MESSAGE')));
                      }

                      if (isLidChatId(normalizedChatId)) {
                        const [identifier] = splitChatId(normalizedChatId);

                        return identifier.length >= 3
                          ? Promise.resolve()
                          : Promise.reject(new Error(t('CHAT_ID_INVALID_VALUE_MESSAGE')));
                      }

                      const phone = getPhoneNumberFromChatId(normalizedChatId).replace(/\D/g, '');

                      if (phone.length < 9) {
                        return Promise.reject(new Error(t('CONTACT_PHONE_INVALID_MESSAGE')));
                      }

                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <ChatIdInput
                  disabled={isEditMode}
                  autoComplete="off"
                  suffixes={isMaxOrTelegram ? [] : ['@c.us', '@lid']}
                  placeholder={
                    isMaxOrTelegram
                      ? chatIdType === 'chatId'
                        ? t('CONTACT_CHAT_ID_LABEL')
                        : t('CHAT_ID_PHONE_PLACEHOLDER')
                      : undefined
                  }
                />
              </Form.Item>
            );
          }}
        </Form.Item>

        <Form.Item
          name="contactName"
          label={t('CONTACT_NAME_LABEL')}
          rules={[
            { required: true, message: t('EMPTY_FIELD_ERROR') },
            { whitespace: true, message: t('EMPTY_FIELD_ERROR') },
          ]}
        >
          <Input autoComplete="off" placeholder={t('CONTACT_NAME_LABEL')} maxLength={100} />
        </Form.Item>

        <Form.Item name="contactSecondName" label={t('CONTACT_SECOND_NAME_LABEL')}>
          <Input autoComplete="off" placeholder={t('CONTACT_SECOND_NAME_LABEL')} maxLength={100} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ContactFormModal;
