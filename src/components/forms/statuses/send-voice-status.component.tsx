import { FC } from 'react';

import { Button, ColorPicker, Form, Input } from 'antd';
import { useTranslation } from 'react-i18next';

import Participants from './participants.component';
import { formItemMethodApiLayout } from 'configs';
import { useActions, useAppDispatch, useAppSelector, useFormWithLanguageValidation } from 'hooks';
import {
  useSendMediaStatusMutation,
  useSendVoiceStatusMutation,
} from 'services/green-api/endpoints';
import { selectInstance } from 'store/slices/instances.slice';
import { SendVoiceStatusFormValues } from 'types';
import { isApiError } from 'utils';

interface SendVoiceStatusProperties {
  isMedia?: boolean;
}

const SendVoiceStatus: FC<SendVoiceStatusProperties> = ({ isMedia }) => {
  const instanceCredentials = useAppSelector(selectInstance);

  const { t } = useTranslation();

  const [sendStatus, { isLoading }] = useSendVoiceStatusMutation();
  const [setMediaStatus, { isLoading: isMediaStatusLoading }] = useSendMediaStatusMutation();

  const [form] = useFormWithLanguageValidation<SendVoiceStatusFormValues>();

  const dispatch = useAppDispatch();
  const { setActiveSendingMode } = useActions();

  const onFinish = async (values: SendVoiceStatusFormValues) => {
    const color = values.backgroundColor?.toHexString();

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

    const { error } = isMedia ? await setMediaStatus(body) : await sendStatus(body);
    console.log(error);

    if (isApiError(error)) {
      switch (error.status) {
        case 466:
          return form.setFields([{ name: 'response', errors: [t('QUOTE_EXCEEDED')] }]);
        default:
          const errorData = error.data;
          const errorMessage =
            typeof errorData === 'object' && errorData !== null && 'message' in errorData
              ? (errorData as { message: string }).message
              : 'Unknown error';
          return form.setFields([{ name: 'response', errors: [errorMessage] }]);
      }
    }

    dispatch(setActiveSendingMode(null));
  };

  return (
    <Form form={form} {...formItemMethodApiLayout} onFinish={onFinish}>
      <Form.Item
        name="urlFile"
        rules={[{ required: true, message: t('EMPTY_FIELD_ERROR') }]}
        label={t('URL_FILE_LABEL')}
      >
        <Input placeholder={t('URL_FILE_PLACEHOLDER')} />
      </Form.Item>

      <Form.Item
        name="fileName"
        rules={[{ required: true, message: t('EMPTY_FIELD_ERROR') }]}
        label={t('FILE_NAME_LABEL')}
      >
        <Input placeholder={t('FILE_NAME_PLACEHOLDER')} />
      </Form.Item>

      {!isMedia && (
        <Form.Item name="backgroundColor" label={t('BACKGROUND_COLOR_LABEL')}>
          <ColorPicker disabledAlpha defaultValue="#000" />
        </Form.Item>
      )}

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
        <Button
          disabled={isLoading || isMediaStatusLoading}
          htmlType="submit"
          size="large"
          block
          type="primary"
        >
          {t('SEND_MESSAGE')}
        </Button>
      </Form.Item>

      <Form.Item style={{ marginBottom: 0 }} name="response" className="response-form-item" />
    </Form>
  );
};

export default SendVoiceStatus;
