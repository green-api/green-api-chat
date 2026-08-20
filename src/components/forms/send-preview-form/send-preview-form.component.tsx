import { FC, useEffect, useRef } from 'react';

import { Button, Flex, Form } from 'antd';
import { useTranslation } from 'react-i18next';

import CustomPreviewFields from './custom-preview-form-fields.component';
import CustomPreviewSwitch from './custom-preview-switch.component';
import { PreviewSizeSelect } from './preview-size-select.component';
import { Preview } from './preview.component';
import TextArea from 'components/UI/text-area.component';
import { formItemDefaultLayout } from 'configs';
import { useActions, useAppDispatch, useAppSelector, useFormWithLanguageValidation } from 'hooks';
import { useSendMessageMutation } from 'services/green-api/endpoints';
import { selectActiveChat } from 'store/slices/chat.slice';
import { selectInstance } from 'store/slices/instances.slice';
import { ActiveChat, ChatFormValues } from 'types';

const PreviewedMessageForm: FC = () => {
  const instanceCredentials = useAppSelector(selectInstance);
  const activeChat = useAppSelector(selectActiveChat) as ActiveChat;

  const { setActiveSendingMode } = useActions();

  const dispatch = useAppDispatch();

  const { t } = useTranslation();

  const [sendMessage, { isLoading: isSendMessageLoading }] = useSendMessageMutation();

  const [form] = useFormWithLanguageValidation<ChatFormValues>();
  const responseTimerReference = useRef<number | null>(null);

  const isCustomPreview = Form.useWatch('isCustomPreview', form);
  const isBigPreview = Form.useWatch('typePreview', form) === 'large';
  const messageFormValuesRaw = Form.useWatch([], form);

  const messageFormValues = {
    ...messageFormValuesRaw,
    typePreview: messageFormValuesRaw?.typePreview ?? '',
    message: messageFormValuesRaw?.message ?? '',
    customPreview: messageFormValuesRaw?.customPreview,
  };

  const onSendMessage = async (values: ChatFormValues) => {
    const { message, quotedMessageId, typePreview, customPreview } = values;

    if (!message) {
      return;
    }

    const body = {
      ...instanceCredentials,
      chatId: activeChat.chatId,
      message,
      typePreview,
      quotedMessageId,
      linkPreview: true,
      customPreview,
    };

    if (responseTimerReference.current) {
      clearTimeout(responseTimerReference.current);

      responseTimerReference.current = null;
    }

    form.setFields([{ name: 'response', errors: [], warnings: [] }]);

    const { data, error } = await sendMessage(body);

    if (error && 'status' in error && error.status === 466) {
      form.setFields([{ name: 'response', errors: [t('QUOTE_EXCEEDED')] }]);

      return;
    }

    if (data) {
      dispatch(setActiveSendingMode(null));

      form.resetFields();

      responseTimerReference.current = setTimeout(() => {
        form.setFields([{ name: 'response', errors: [], warnings: [] }]);
      }, 5000);
    }
  };

  useEffect(() => {
    form.setFields([{ name: 'message', errors: [] }]);
  }, [activeChat.chatId, form]);

  return (
    <Flex wrap gap={32}>
      <Form
        name="chat-form"
        onFinish={onSendMessage}
        onSubmitCapture={() => form.setFields([{ name: 'response', errors: [], warnings: [] }])}
        form={form}
        onKeyDown={(e) => !e.ctrlKey && e.key === 'Enter' && form.submit()}
        disabled={isSendMessageLoading}
        style={{ flexGrow: 1 }}
        labelCol={{ style: { width: 300 } }}
      >
        <Form.Item
          name="message"
          label={t('MESSAGE')}
          key="message"
          required
          normalize={(value) => {
            form.setFields([{ name: 'response', warnings: [] }]);

            return value;
          }}
        >
          <TextArea minRows={5} />
        </Form.Item>

        <Form.Item
          {...formItemDefaultLayout}
          name="quotedMessageId"
          key="quotedMessageId"
          label={t('QUOTED_MESSAGE_ID')}
          normalize={(value) => {
            form.setFields([{ name: 'response', warnings: [] }]);

            return value;
          }}
        >
          <TextArea />
        </Form.Item>

        <PreviewSizeSelect />

        <CustomPreviewSwitch />

        {isCustomPreview && <CustomPreviewFields form={form} isBigPreview={isBigPreview} />}

        <Form.Item style={{ marginBottom: 0 }} {...formItemDefaultLayout}>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            className="w-100"
            loading={isSendMessageLoading}
          >
            {t('SEND_MESSAGE')}
          </Button>
        </Form.Item>
      </Form>
      <Preview messageFormValues={messageFormValues} />
    </Flex>
  );
};

export default PreviewedMessageForm;
