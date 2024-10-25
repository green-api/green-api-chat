import { FC, useCallback } from 'react';

import { Button, Form, Input } from 'antd';
import { useTranslation } from 'react-i18next';

import FormListFields from './form-list-feilds.component';
import TemplateMessagePreview from 'components/shared/message/template-message/template-message-preview.component';
import SelectTemplate from 'components/UI/select/select-template.component';
import { formItemMethodApiLayout } from 'configs';
import { useActions, useAppDispatch, useAppSelector, useFormWithLanguageValidation } from 'hooks';
import { useSendTemplateMutation } from 'services/green-api/endpoints';
import { journalsGreenApiEndpoints } from 'services/green-api/endpoints/journals.green-api.endpoints';
import {
  selectActiveChat,
  selectActiveTemplate,
  selectMessageCount,
} from 'store/slices/chat.slice';
import { selectInstance } from 'store/slices/instances.slice';
import { ActiveChat, SelectTemplateOption, SendTemplateValues } from 'types';
import { getErrorMessage, isApiError } from 'utils';

const SendTemplateForm: FC = () => {
  const instanceCredentials = useAppSelector(selectInstance);
  const activeChat = useAppSelector(selectActiveChat) as ActiveChat;
  const messageCount = useAppSelector(selectMessageCount);
  const activeTemplate = useAppSelector(selectActiveTemplate);

  const dispatch = useAppDispatch();
  const { setActiveSendingMode, setActiveTemplate } = useActions();

  const { t } = useTranslation();

  const [sendTemplate, { isLoading }] = useSendTemplateMutation();

  const [form] = useFormWithLanguageValidation<SendTemplateValues>();

  const currentCount = new Set(activeTemplate?.data.match(/{{\d}}/g) || []).size;

  const onSelectTemplate = useCallback((option: SelectTemplateOption) => {
    const newCount = new Set(option.template.data.match(/{{\d}}/g) || []).size;

    form.resetFields(['params']);

    form.setFields([
      { name: 'templateId', value: option.value },
      { name: 'params', value: new Array(newCount).fill(0).map(() => ({ param: '' })) },
    ]);

    setActiveTemplate(option.template);
  }, []);

  const onFinish = async (values: SendTemplateValues) => {
    const params = values.params ? values.params.map((item) => item.param) : undefined;

    const body = {
      ...instanceCredentials,
      chatId: activeChat.chatId,
      templateId: values.templateId,
      params: params,
    };

    form.setFields([{ name: 'response', errors: [], warnings: [] }]);

    const { data, error } = await sendTemplate(body);

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
          idInstance: instanceCredentials.idInstance,
          apiTokenInstance: instanceCredentials.apiTokenInstance,
          chatId: activeChat.chatId,
          count: messageCount,
        },
        (draftChatHistory) => {
          const existingMessage = draftChatHistory.find((msg) => msg.idMessage === data.idMessage);
          if (existingMessage) {
            console.log('message already in chat history');

            return;
          }

          draftChatHistory.push({
            type: 'outgoing',
            typeMessage: 'templateMessage',
            timestamp: Math.floor(Date.now() / 1000),
            senderName: '',
            senderContactName: '',
            idMessage: data.idMessage,
            chatId: activeChat.chatId,
            templateMessage: {
              templateId: values.templateId,
              params: params,
            },
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
        name="templateId"
        rules={[{ required: true, message: t('EMPTY_FIELD_ERROR') }]}
        label={t('TEMPLATE_NAME')}
      >
        <SelectTemplate onSelect={onSelectTemplate} />
      </Form.Item>
      {currentCount > 0 ? (
        <Form.Item
          name="params"
          rules={[{ required: true, message: t('EMPTY_FIELD_ERROR') }]}
          label={t('PARAMS_LABEL')}
        >
          <FormListFields
            listProperties={{
              name: 'params',
            }}
            minFields={currentCount}
            maxFields={currentCount}
            containerClassNames="expand-first-item-space"
            items={[
              {
                key: 'param',
                name: 'param',
                rules: [{ required: true, message: t('EMPTY_FIELD_ERROR') }],
                children: <Input placeholder={t('PARAM_LABEL')} />,
              },
            ]}
          />
        </Form.Item>
      ) : null}

      {activeTemplate && (
        <>
          <Form.Item label={t('PREVIEW')}>
            <TemplateMessagePreview template={activeTemplate} />
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
                offset: 9,
              },
            }}
          >
            <Button disabled={isLoading} htmlType="submit" size="large" block={true} type="primary">
              {t('SEND_MESSAGE')}
            </Button>
          </Form.Item>
        </>
      )}
      <Form.Item style={{ marginBottom: 0 }} name="response" className="response-form-item" />
    </Form>
  );
};

export default SendTemplateForm;
