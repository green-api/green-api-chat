import { FC, useEffect, useState } from 'react';

import { Button, Popover, Tabs, Form } from 'antd';
import useFormInstance from 'antd/es/form/hooks/useFormInstance';
import { InternalFieldProps } from 'rc-field-form/lib/Field';
import { useTranslation } from 'react-i18next';

import FormListFields from '../form-list-feilds.component';
import ChatIdInput from 'components/UI/chat-id-input.component';
import { isLidChatId, splitChatId } from 'utils/chat-id.utils';

const ParticipantsPopover: FC = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [activeKey, setActiveKey] = useState<'all_contacts' | 'specified_contacts'>('all_contacts');

  const form = useFormInstance();

  useEffect(() => {
    if (activeKey === 'all_contacts') {
      form.setFieldValue('participants', []);
    }
  }, [activeKey, form]);

  const getParticipantChatIdElement = (isRequired = true) => {
    const rules: InternalFieldProps['rules'] = [
      {
        validator: (_, value: string) => {
          if (!value) return Promise.resolve();
          const [identifier] = splitChatId(value);
          const minLength = isLidChatId(value) ? 3 : 9;

          return identifier.length >= minLength
            ? Promise.resolve()
            : Promise.reject(new Error(t('CHAT_ID_INVALID_VALUE_MESSAGE')));
        },
      },
    ];
    if (isRequired) {
      rules.push({ required: true, message: t('EMPTY_FIELD_ERROR') });
    }

    return {
      key: 'participant-chat-id',
      rules,
      children: <ChatIdInput suffixes={['@c.us', '@lid']} />,
    };
  };

  const content = (
    <div>
      <Tabs
        activeKey={activeKey}
        onChange={(key) => setActiveKey(key as 'all_contacts' | 'specified_contacts')}
        centered
        items={[
          {
            key: 'all_contacts',
            label: t('SEND_ALL_CONTACTS'),
            children: <></>,
          },
          {
            key: 'specified_contacts',
            label: t('SEND_ONLY_SPECIFIED_CONTACTS'),
            children: (
              <Form.Item
                name="participants"
                initialValue={[]}
                style={{ marginTop: 16, maxHeight: 300, overflowY: 'auto' }}
              >
                <FormListFields
                  listProperties={{ name: 'participants' }}
                  minFields={1}
                  items={[getParticipantChatIdElement(true)]}
                />
              </Form.Item>
            ),
          },
        ]}
      />
    </div>
  );

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      trigger="click"
      placement="bottom"
      content={content}
    >
      <Button block>
        {activeKey === 'all_contacts' ? t('SEND_ALL_CONTACTS') : t('SEND_ONLY_SPECIFIED_CONTACTS')}
      </Button>
    </Popover>
  );
};

export default ParticipantsPopover;
