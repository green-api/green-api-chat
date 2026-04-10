import { FC } from 'react';

import { Form, Input, Modal } from 'antd';
import type { FormInstance } from 'antd/es/form';
import type { i18n } from 'i18next';

import { ContactFormValues, normalizeChatId } from './contacts.helpers';
import { getPhoneNumberFromChatId } from 'utils';

interface ContactFormModalProps {
  t: i18n['t'];
  isOpen: boolean;
  isEditMode: boolean;
  isLoading: boolean;
  form: FormInstance<ContactFormValues>;
  onCancel: () => void;
  onSubmit: (values: ContactFormValues) => void;
}

const ContactFormModal: FC<ContactFormModalProps> = ({
  t,
  isOpen,
  isEditMode,
  isLoading,
  form,
  onCancel,
  onSubmit,
}) => {
  return (
    <Modal
      title={t(isEditMode ? 'EDIT_CONTACT' : 'ADD_CONTACT')}
      open={isOpen}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText={t(isEditMode ? 'SAVE_CONTACT_CHANGES' : 'ADD')}
      cancelText={t('CANCEL')}
      confirmLoading={isLoading}
      destroyOnClose
    >
      <Form<ContactFormValues> form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item
          name="chatId"
          label={t('CONTACT_CHAT_ID_LABEL')}
          rules={[
            { required: true, message: t('EMPTY_FIELD_ERROR') },
            {
              validator: (_, value) => {
                const normalizedChatId = normalizeChatId(value ?? '');

                if (!normalizedChatId) {
                  return Promise.resolve();
                }

                if (normalizedChatId.includes('@g.us')) {
                  return Promise.reject(new Error(t('CONTACT_PHONE_INVALID_MESSAGE')));
                }

                const phone = getPhoneNumberFromChatId(normalizedChatId).replace(/\D/g, '');

                if (phone.length < 9) {
                  return Promise.reject(new Error(t('CONTACT_PHONE_INVALID_MESSAGE')));
                }

                return Promise.resolve();
              },
            },
          ]}
          normalize={(value: string) => value?.replace(/\s/g, '')}
        >
          <Input
            disabled={isEditMode}
            type="tel"
            autoComplete="off"
            placeholder={t('CHAT_ID_PLACEHOLDER')}
          />
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
