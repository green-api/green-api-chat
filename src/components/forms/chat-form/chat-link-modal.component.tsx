import { FC } from 'react';

import { Form, Input, Modal } from 'antd';
import { useTranslation } from 'react-i18next';

export type LinkModalFormValues = {
  linkText: string;
  linkUrl: string;
};

type ChatLinkModalProps = {
  isOpen: boolean;
  form: ReturnType<typeof Form.useForm<LinkModalFormValues>>[0];
  onCancel: () => void;
  onOk: () => void;
};

const ChatLinkModal: FC<ChatLinkModalProps> = ({ isOpen, form, onCancel, onOk }) => {
  const { t } = useTranslation();

  return (
    <Modal
      open={isOpen}
      title={t('MESSAGE_FORMAT_LINK_MODAL_TITLE')}
      okText={t('ADD')}
      cancelText={t('CANCEL')}
      onCancel={onCancel}
      onOk={onOk}
      destroyOnClose
    >
      <Form form={form} layout="vertical" requiredMark={false}>
        <Form.Item
          name="linkText"
          label={t('MESSAGE_FORMAT_LINK_TEXT_LABEL')}
          rules={[{ required: true, message: t('EMPTY_FIELD_ERROR') }]}
        >
          <Input autoComplete="off" />
        </Form.Item>

        <Form.Item
          name="linkUrl"
          label={t('MESSAGE_FORMAT_LINK_URL_LABEL')}
          rules={[
            { required: true, message: t('EMPTY_FIELD_ERROR') },
            {
              validator: (_, value: string) => {
                const trimmedValue = value?.trim();

                if (!trimmedValue) {
                  return Promise.resolve();
                }

                const normalizedValue = /^https?:\/\//i.test(trimmedValue)
                  ? trimmedValue
                  : `https://${trimmedValue}`;

                try {
                  const parsed = new URL(normalizedValue);
                  if (!parsed.hostname) {
                    throw new Error('EMPTY_HOST');
                  }

                  return Promise.resolve();
                } catch {
                  return Promise.reject(new Error(t('CHAT_ID_INVALID_VALUE_MESSAGE')));
                }
              },
            },
          ]}
        >
          <Input autoComplete="off" placeholder="https://example.com" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ChatLinkModal;
