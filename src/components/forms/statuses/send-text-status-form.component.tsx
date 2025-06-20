import { FC } from 'react';

import { Button, ColorPicker, Form, Input } from 'antd';
import { useTranslation } from 'react-i18next';

import Participants from './participants.component';
import SelectStatusFont from './select-status-font.component';
import { formItemMethodApiLayout } from 'configs';
import { useActions, useAppDispatch, useAppSelector, useFormWithLanguageValidation } from 'hooks';
import { useSendTextStatusMutation } from 'services/green-api/endpoints';
import { selectInstance } from 'store/slices/instances.slice';
import { SendTextStatusFormValues } from 'types';
import { getErrorMessage, isApiError } from 'utils';

const SendTextStatusForm: FC = () => {
  const instanceCredentials = useAppSelector(selectInstance);

  const { t } = useTranslation();

  const [sendStatus, { isLoading }] = useSendTextStatusMutation();

  const [form] = useFormWithLanguageValidation<SendTextStatusFormValues>();

  const dispatch = useAppDispatch();
  const { setActiveSendingMode } = useActions();

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
      backgroundColor: color,
    };

    form.setFields([{ name: 'response', errors: [], warnings: [] }]);

    const { error } = await sendStatus(body);

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

    dispatch(setActiveSendingMode(null));
  };

  return (
    <Form form={form} {...formItemMethodApiLayout} onFinish={onFinish}>
      <Form.Item
        name="message"
        rules={[{ required: true, message: t('EMPTY_FIELD_ERROR') }]}
        label={t('MESSAGE_LABEL')}
      >
        <Input placeholder={t('MESSAGE_PLACEHOLDER')} />
      </Form.Item>

      <Form.Item name="backgroundColor" label={t('BACKGROUND_COLOR_LABEL')}>
        <ColorPicker disabledAlpha defaultValue="#000" />
      </Form.Item>

      <SelectStatusFont />

      <Participants />

      <Form.Item
        style={{ marginBottom: 0 }}
        wrapperCol={{
          span: 20,
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
        <Button disabled={isLoading} htmlType="submit" size="large" block type="primary">
          {t('SEND_MESSAGE')}
        </Button>
      </Form.Item>

      <Form.Item style={{ marginBottom: 0 }} name="response" className="response-form-item" />
    </Form>
  );
};

export default SendTextStatusForm;
