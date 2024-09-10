import { FC } from 'react';

import { Button, Form, Input, Switch } from 'antd';
import { useTranslation } from 'react-i18next';

import FormListFields from './form-list-feilds.component';
import { formItemMethodApiLayout } from 'configs';
import { useActions, useAppDispatch, useAppSelector, useFormWithLanguageValidation } from 'hooks';
import { useSendPollMutation } from 'services/green-api/endpoints';
import { journalsGreenApiEndpoints } from 'services/green-api/endpoints/journals.green-api.endpoints';
import { selectActiveChat } from 'store/slices/chat.slice';
import { selectCredentials } from 'store/slices/user.slice';
import { ActiveChat, SendPollFormValues } from 'types';
import { getErrorMessage, isApiError } from 'utils';

const SendPollForm: FC = () => {
  const userCredentials = useAppSelector(selectCredentials);
  const activeChat = useAppSelector(selectActiveChat) as ActiveChat;

  const dispatch = useAppDispatch();
  const { setActiveSendingMode } = useActions();

  const { t } = useTranslation();

  const [sendPoll, { isLoading }] = useSendPollMutation();

  const [form] = useFormWithLanguageValidation<SendPollFormValues>();

  const onFinish = async (values: SendPollFormValues) => {
    const body = {
      ...userCredentials,
      ...values,
      chatId: activeChat.chatId,
    };

    form.setFields([{ name: 'response', errors: [], warnings: [] }]);

    const { data, error } = await sendPoll(body);

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
            typeMessage: 'pollMessage',
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
        name="message"
        rules={[{ required: true, message: t('EMPTY_FIELD_ERROR') }]}
        label={t('MESSAGE_LABEL')}
      >
        <Input placeholder={t('MESSAGE_PLACEHOLDER')} />
      </Form.Item>
      <Form.Item name="options" required label={t('OPTIONS_LABEL')}>
        <FormListFields
          listProperties={{
            name: 'options',
          }}
          minFields={2}
          maxFields={12}
          containerClassNames="expand-first-item-space"
          items={[
            {
              key: 'options-optionName',
              name: 'optionName',
              rules: [
                (formInstance) => ({
                  validator: (fieldData, fieldValue) => {
                    const { options }: { options: { optionName: string }[] } =
                      formInstance.getFieldsValue();

                    if (!fieldValue) return Promise.reject(t('EMPTY_FIELD_ERROR'));

                    if ('field' in fieldData) {
                      const index = +(fieldData.field as string).replaceAll(/\D/g, '');

                      if (
                        options.some(
                          (value, optionIndex) =>
                            optionIndex !== index && value?.optionName === fieldValue
                        )
                      ) {
                        return Promise.reject(t('DUPLICATED_FIELD_ERROR'));
                      }
                    }

                    return Promise.resolve();
                  },
                }),
              ],
              children: <Input placeholder={t('OPTION_PLACEHOLDER')} />,
            },
          ]}
        />
      </Form.Item>
      <Form.Item name="quotedMessageId" label={t('QUOTED_MESSAGE_ID_LABEL')}>
        <Input placeholder={t('QUOTED_MESSAGE_ID_LABEL')} />
      </Form.Item>
      <Form.Item name="multipleAnswers" label={t('MULTIPLE_ANSWERS_LABEL')}>
        <Switch />
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

export default SendPollForm;
