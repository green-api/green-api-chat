import { FC } from 'react';

import { Button, Form, Input } from 'antd';
import { useTranslation } from 'react-i18next';

import { formItemMethodApiLayout } from 'configs';
import { useActions, useAppDispatch, useAppSelector, useFormWithLanguageValidation } from 'hooks';
import { useSendLocationMutation } from 'services/green-api/endpoints';
import { journalsGreenApiEndpoints } from 'services/green-api/endpoints/journals.green-api.endpoints';
import { selectActiveChat } from 'store/slices/chat.slice';
import { selectCredentials } from 'store/slices/user.slice';
import { ActiveChat, SendLocationFormValues } from 'types';
import { getErrorMessage, isApiError } from 'utils';

const SendLocationForm: FC = () => {
  const userCredentials = useAppSelector(selectCredentials);
  const activeChat = useAppSelector(selectActiveChat) as ActiveChat;

  const dispatch = useAppDispatch();
  const { setActiveSendingMode } = useActions();

  const { t } = useTranslation();

  const [sendLocation, { isLoading }] = useSendLocationMutation();

  const [form] = useFormWithLanguageValidation<SendLocationFormValues>();

  const onFinish = async (values: SendLocationFormValues) => {
    const body = {
      ...userCredentials,
      ...values,
      chatId: activeChat.chatId,
    };

    form.setFields([{ name: 'response', errors: [], warnings: [] }]);

    const { data, error } = await sendLocation(body);

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
      const updateChatHistoryThunk = journalsGreenApiEndpoints.util?.updateQueryData(
        'getChatHistory',
        {
          idInstance: userCredentials.idInstance,
          apiTokenInstance: userCredentials.apiTokenInstance,
          chatId: activeChat.chatId,
          count: 80,
        },
        (draftChatHistory) => {
          const existingMessage = draftChatHistory.find((msg) => msg.idMessage === data.idMessage);
          if (existingMessage) {
            console.log('message already in chat history');

            return;
          }

          draftChatHistory.push({
            type: 'outgoing',
            typeMessage: 'locationMessage',
            location: {
              ...values,
              jpegThumbnail: '',
            },
            timestamp: Math.floor(Date.now() / 1000),
            senderName: '',
            senderContactName: '',
            idMessage: data.idMessage,
            chatId: activeChat.chatId,
            statusMessage: 'sent',
          });

          return draftChatHistory;
        }
      );

      dispatch(updateChatHistoryThunk);

      form.setFields([{ name: 'response', warnings: [t('SUCCESS_SENDING_MESSAGE')] }]);

      setActiveSendingMode(null);
    }
  };

  return (
    <Form form={form} {...formItemMethodApiLayout} onFinish={onFinish}>
      <Form.Item
        name="latitude"
        label={t('LATITUDE_LABEL')}
        rules={[{ required: true, message: t('EMPTY_FIELD_ERROR') }]}
        normalize={(value: string) => {
          return value.replaceAll(/\D/g, (substring, _, string) => {
            if (substring === '.' && (string.match(/\./g) || []).length < 2) return substring;

            return '';
          });
        }}
      >
        <Input placeholder={t('LATITUDE_LABEL')} />
      </Form.Item>
      <Form.Item
        name="longitude"
        label={t('LONGITUDE_LABEL')}
        rules={[{ required: true, message: t('EMPTY_FIELD_ERROR') }]}
        normalize={(value: string) => {
          return value.replaceAll(/\D/g, (substring, _, string) => {
            if (substring === '.' && (string.match(/\./g) || []).length < 2) return substring;

            return '';
          });
        }}
      >
        <Input placeholder={t('LONGITUDE_LABEL')} />
      </Form.Item>
      <Form.Item name="nameLocation" label={t('LOCATION_NAME_LABEL')}>
        <Input placeholder={t('LOCATION_NAME_LABEL')} />
      </Form.Item>
      <Form.Item name="address" label={t('ADDRESS_LABEL')}>
        <Input placeholder={t('ADDRESS_LABEL')} />
      </Form.Item>
      <Form.Item name="quotedMessageId" label={t('QUOTED_MESSAGE_ID_LABEL')}>
        <Input placeholder={t('QUOTED_MESSAGE_ID_LABEL')} />
      </Form.Item>
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
            offset: 8,
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

export default SendLocationForm;
