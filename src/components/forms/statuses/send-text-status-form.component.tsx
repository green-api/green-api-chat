import { FC } from 'react';

import { Button, ColorPicker, Form, Input } from 'antd';
import { useTranslation } from 'react-i18next';

import Participants from './participants.component';
import SelectStatusFont from './select-status-font.component';
import { statusFormLayout } from 'configs';
import { useAppSelector, useFormWithLanguageValidation } from 'hooks';
import { useSendTextStatusMutation } from 'services/green-api/endpoints';
import { selectInstance } from 'store/slices/instances.slice';
import { SendTextStatusFormValues } from 'types';
import { getErrorMessage, isApiError } from 'utils';

const SendTextStatusForm: FC = () => {
  const instanceCredentials = useAppSelector(selectInstance);

  const { t } = useTranslation();

  const [sendStatus, { isLoading }] = useSendTextStatusMutation();

  const [form] = useFormWithLanguageValidation<SendTextStatusFormValues>();

  // const dispatch = useAppDispatch();x
  // const { setActiveSendingMode } = useActions();

  const onFinish = async (values: SendTextStatusFormValues) => {
    const color = values.backgroundColor?.toHexString?.().toUpperCase();

    const participants = values.participants?.map((participant) => {
      const cleaned = participant.trim();
      return cleaned.endsWith('@c.us') ? cleaned : `${cleaned}@c.us`;
    });

    const body = {
      ...instanceCredentials,
      ...values,
      participants,
      backgroundColor: color ?? '#000000',
    };

    form.setFields([{ name: 'response', errors: [], warnings: [] }]);

    const { error, data } = await sendStatus(body);

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

    form.setFields([
      { name: 'response', warnings: [`${t('SENT_STATUS_WARNING')} ${data?.idMessage}`] },
    ]);

    // dispatch(setActiveSendingMode(null));
  };

  return (
    <Form form={form} {...statusFormLayout} onFinish={onFinish}>
      <Form.Item
        name="message"
        rules={[{ required: true, message: t('EMPTY_FIELD_ERROR') }]}
        label={t('MESSAGE_LABEL')}
      >
        <Input placeholder={t('MESSAGE_PLACEHOLDER')} />
      </Form.Item>

      <Form.Item name="backgroundColor" initialValue="#000000" label={t('BACKGROUND_COLOR_LABEL')}>
        <ColorPicker disabledAlpha defaultValue="#000000" />
      </Form.Item>

      <SelectStatusFont />

      <Participants />

      <Button disabled={isLoading} htmlType="submit" size="large" block type="primary">
        {t('SEND_MESSAGE')}
      </Button>

      <Form.Item style={{ marginBottom: 0 }} name="response" className="response-form-item" />
    </Form>
  );
};

export default SendTextStatusForm;
