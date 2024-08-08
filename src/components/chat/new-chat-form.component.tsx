import { FC, useState } from 'react';

import { Button, Col, Form, Input, Row, Select } from 'antd';
import { useTranslation } from 'react-i18next';

import { useAppDispatch, useAppSelector } from 'hooks';
import { useCheckWhatsappMutation, useSendMessageMutation } from 'services/green-api/endpoints';
import { journalsGreenApiEndpoints } from 'services/green-api/endpoints/journals.green-api.endpoints';
import { selectCredentials } from 'store/slices/user.slice';
import { NewChatFormValues } from 'types';

const NewChatForm: FC = () => {
  const userCredentials = useAppSelector(selectCredentials);

  const dispatch = useAppDispatch();

  const { t } = useTranslation();

  const [sendMessage, { isLoading }] = useSendMessageMutation();
  const [checkWhatsapp] = useCheckWhatsappMutation();

  const [form] = Form.useForm<NewChatFormValues>();

  const [defaultTypeChatValue, setDefaultTypeChatValue] = useState('@c.us');

  const onSendMessage = async (values: NewChatFormValues) => {
    const { message, chatId } = values;

    const fullChatId = chatId[0] + chatId[1];

    const body = {
      idInstance: userCredentials.idInstance,
      apiTokenInstance: userCredentials.apiTokenInstance,
      chatId: fullChatId,
      message,
    };

    const { data } = await sendMessage(body);
    form.setFieldValue('message', '');

    if (data) {
      const updateChatHistoryThunk = journalsGreenApiEndpoints.util?.updateQueryData(
        'lastOutgoingMessages',
        {
          idInstance: userCredentials.idInstance,
          apiTokenInstance: userCredentials.apiTokenInstance,
          minutes: 3000,
        },
        (draftChatHistory) => {
          const existingMessage = draftChatHistory.find((msg) => msg.idMessage === data.idMessage);
          if (existingMessage) {
            console.log('message already in chat history');

            return draftChatHistory;
          }

          draftChatHistory.push({
            type: 'outgoing',
            typeMessage: 'textMessage',
            textMessage: message,
            timestamp: Math.floor(Date.now() / 1000),
            senderName: '',
            senderContactName: '',
            idMessage: data.idMessage,
            chatId: fullChatId,
            statusMessage: 'sent',
          });

          return draftChatHistory;
        }
      );

      dispatch(updateChatHistoryThunk);
    }
  };

  return (
    <Form name="new-chat-form" className="chat-form" onFinish={onSendMessage} form={form}>
      <Form.Item required>
        <Row gutter={5}>
          <Col span={18}>
            <Form.Item
              name={['chatId', '0']}
              style={{ marginBottom: 0 }}
              normalize={(value: string) => {
                value =
                  defaultTypeChatValue === '@g.us'
                    ? value.replaceAll(/[^\d-]/g, '')
                    : value.replaceAll(/\D/g, '');

                return value;
              }}
              rules={[
                { required: true, message: t('EMPTY_FIELD_ERROR') },
                { min: 9, message: t('CHAT_ID_INVALID_VALUE_MESSAGE') },
                () => ({
                  validator: async (_, value) => {
                    if (defaultTypeChatValue === '@g.us' || !value) {
                      return;
                    }

                    const { data } = await checkWhatsapp({
                      idInstance: userCredentials.idInstance,
                      apiTokenInstance: userCredentials.apiTokenInstance,
                      phoneNumber: value,
                    });

                    if (data && data.existsWhatsapp) {
                      return Promise.resolve();
                    }

                    return Promise.reject(new Error('У данного номера отсутствует Whatsapp'));
                  },
                }),
              ]}
              validateDebounce={800}
            >
              <Input autoComplete="off" type="tel" placeholder={t('CHAT_ID_PLACEHOLDER')} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              initialValue={defaultTypeChatValue}
              style={{ marginBottom: 0 }}
              name={['chatId', '1']}
            >
              <Select
                onSelect={(value) => {
                  setDefaultTypeChatValue(value);
                }}
                options={[
                  { value: '@c.us', label: '@c.us' },
                  { value: '@g.us', label: '@g.us' },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form.Item>
      <Form.Item name="message" rules={[{ required: true, message: t('EMPTY_FIELD_ERROR') }]}>
        <Input.TextArea
          autoSize={{ minRows: 5, maxRows: 5 }}
          maxLength={500}
          placeholder={t('MESSAGE_PLACEHOLDER')}
        />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" className="login-form-button" loading={isLoading}>
          {t('SEND_MESSAGE')}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default NewChatForm;
