import { useState } from 'react';

import { Form, Input } from 'antd';
import { InternalFieldProps } from 'rc-field-form/lib/Field';
import { useTranslation } from 'react-i18next';

import SelectParticipants from './select-participants.component';
import FormListFields from '../form-list-feilds.component';
import { formItemMethodApiLayout } from 'configs';

const Participants = () => {
  const { t } = useTranslation();

  const [showListParticipants, setShowListParticipants] = useState(false);

  const getParticipantChatIdElement = (
    isRequired = true,
    showLabel = true,
    key = 'participantChatId',
    name = 'participantChatId'
  ) => {
    const rules: InternalFieldProps['rules'] = [
      { min: 9, message: t('CHAT_ID_INVALID_VALUE_MESSAGE') },
    ];

    if (isRequired) rules.push({ required: true, message: t('EMPTY_FIELD_ERROR') });

    return {
      key: key,
      name: name,
      label: showLabel ? t('CHAT_ID_PHONE_PLACEHOLDER') : undefined,
      rules,
      normalize: (value: string) => {
        return value.replaceAll(/\D/g, '');
      },
      children: (
        <Input type="tel" placeholder={t('CHAT_ID_PHONE_PLACEHOLDER')} addonAfter="@c.us" />
      ),
    };
  };

  return (
    <Form.Item
      label={<span title={t('PARTICIPANTS_LABEL')}>{t('PARTICIPANTS_LABEL')}</span>}
      {...formItemMethodApiLayout}
    >
      <SelectParticipants
        onChange={() => {
          if (showListParticipants) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            dispatch(setCodeExampleArguments({ arguments: { participants: undefined } }));

            setShowListParticipants(false);

            return;
          }

          setShowListParticipants(true);
        }}
      />

      {showListParticipants && (
        <Form.Item style={{ marginBottom: 0 }} className="margin-top" name="participants">
          <FormListFields
            listProperties={{
              name: 'participants',
            }}
            minFields={1}
            items={[{ ...getParticipantChatIdElement(true, false) }]}
          />
        </Form.Item>
      )}
    </Form.Item>
  );
};

export default Participants;
