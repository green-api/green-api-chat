import { SendOutlined } from '@ant-design/icons';
import { Button, ColorPicker, Flex, Form, Input, message as antdMessage } from 'antd';
import { useTranslation } from 'react-i18next';

import PaletteIcon from 'assets/palette.svg?react';
import Participants from 'components/forms/statuses/participants.component';
import SelectStatusFont from 'components/forms/statuses/select-status-font.component';
import { useActions, useAppSelector, useFormWithLanguageValidation } from 'hooks';
import { useSendTextStatusMutation } from 'services/green-api/endpoints';
import { selectInstance } from 'store/slices/instances.slice';
import { SendTextStatusFormValues } from 'types';
import { isApiError, getErrorMessage } from 'utils';

const fonts = {
  SERIF: 'serif',
  SANS_SERIF: 'sans-serif',
  NORICAN_REGULAR: 'Norican',
  BRYNDAN_WRITE: 'cursive',
  OSWALD_HEAVY: 'Oswald',
};

export const SendTextStatus = () => {
  const instanceCredentials = useAppSelector(selectInstance);

  const { setIsSendingStatus } = useActions();

  const { t } = useTranslation();

  const [sendStatus, { isLoading }] = useSendTextStatusMutation();
  const [form] = useFormWithLanguageValidation<SendTextStatusFormValues>();

  const color = Form.useWatch('backgroundColor', form);
  const font = Form.useWatch('font', form);
  const message = Form.useWatch('message', form);

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
      backgroundColor: color ?? '#792138',
    };

    form.setFields([{ name: 'response', errors: [], warnings: [] }]);

    const { error, data } = await sendStatus(body);

    if (isApiError(error)) {
      antdMessage.error(t('SENT_STATUS_ERROR'));
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
    antdMessage.success(t('SENT_STATUS_SUCCESS'));
    setIsSendingStatus(null);
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: color?.toHexString?.() || '#792138',
        position: 'relative',
      }}
    >
      <Form
        className="textStatusForm"
        form={form}
        onFinish={onFinish}
        style={{ width: '100%', height: '100%' }}
      >
        <Form.Item
          name="message"
          rules={[{ required: true }]}
          help={null}
          validateStatus=""
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: '  translate(-50%, -50%)',
            width: '90%',
          }}
        >
          <Input
            placeholder={t('MESSAGE_PLACEHOLDER')}
            className="statusInput"
            variant="borderless"
            maxLength={500}
            style={{
              fontSize: '4em',
              textAlign: 'center',
              color: '#eee',
              fontFamily: fonts[font as keyof typeof fonts],
            }}
            size="large"
          />
        </Form.Item>
        <Flex justify="flex-end" align="center" gap={25} style={{ margin: 20 }}>
          <SelectStatusFont />
          <Form.Item noStyle name="backgroundColor" initialValue="rgb(121, 33, 56)">
            <ColorPicker disabledAlpha defaultValue="rgb(121, 33, 56)">
              <PaletteIcon fill="#eeeeee" style={{ cursor: 'pointer' }} />
            </ColorPicker>
          </Form.Item>
        </Flex>
        <Flex
          justify="space-between"
          align="center"
          style={{ position: 'absolute', bottom: 20, width: '100%', padding: 20 }}
        >
          <Participants />
          <Button
            disabled={isLoading || !message || message.trim() === ''}
            htmlType="submit"
            size="large"
            type="primary"
            shape="circle"
            style={{ width: 40, height: 40 }}
            icon={<SendOutlined />}
          ></Button>
        </Flex>
      </Form>
    </div>
  );
};
