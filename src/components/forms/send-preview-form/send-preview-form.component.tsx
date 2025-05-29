import { FC, useEffect, useRef } from 'react';

import { InfoCircleOutlined } from '@ant-design/icons';
import { Button, Flex, Form, Switch, Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';

import { PreviewImageInput } from './preview-image-input.component';
import { PreviewSizeSelect } from './preview-size-select.component';
import { Preview } from './preview.component';
import TextArea from 'components/UI/text-area.component';
import { formDefaultLayout } from 'configs';
import { useAppDispatch, useAppSelector, useFormWithLanguageValidation } from 'hooks';
import { useSendMessageMutation } from 'services/green-api/endpoints';
import { journalsGreenApiEndpoints } from 'services/green-api/endpoints/journals.green-api.endpoints';
import { selectActiveChat, selectMessageCount, selectMiniVersion } from 'store/slices/chat.slice';
import { selectInstance } from 'store/slices/instances.slice';
import { ActiveChat, ChatFormValues, MessageInterface } from 'types';
import { getLastChats } from 'utils';

const PreviewedMessageForm: FC = () => {
  const instanceCredentials = useAppSelector(selectInstance);
  const activeChat = useAppSelector(selectActiveChat) as ActiveChat;
  const isMiniVersion = useAppSelector(selectMiniVersion);
  const messageCount = useAppSelector(selectMessageCount);

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
      const updateChatHistoryThunk = journalsGreenApiEndpoints.util?.updateQueryData(
        'getChatHistory',
        {
          ...instanceCredentials,
          chatId: activeChat.chatId,
          count: isMiniVersion ? 10 : messageCount,
        },
        (draftChatHistory) => {
          const existingMessage = draftChatHistory.find((msg) => msg.idMessage === data.idMessage);
          if (existingMessage) {
            console.log('message already in chat history');

            return;
          }

          draftChatHistory.push({
            type: 'outgoing',
            typeMessage: 'textMessage',
            textMessage: message,
            timestamp: Math.floor(Date.now() / 1000),
            senderName: activeChat.senderName || '',
            senderContactName: activeChat.senderContactName || '',
            idMessage: data.idMessage,
            chatId: activeChat.chatId,
            statusMessage: 'sent',
          });

          return draftChatHistory;
        }
      );

      const updateChatListThunk = journalsGreenApiEndpoints.util?.updateQueryData(
        'lastMessages',
        instanceCredentials,
        (draftChatHistory) => {
          const newMessage: MessageInterface = {
            type: 'outgoing',
            typeMessage: 'textMessage',
            textMessage: message,
            timestamp: Math.floor(Date.now() / 1000),
            senderName: activeChat.senderName || '',
            senderContactName: activeChat.senderContactName || '',
            idMessage: data.idMessage,
            chatId: activeChat.chatId,
            statusMessage: 'sent',
          };

          return getLastChats(draftChatHistory, [newMessage], isMiniVersion ? 5 : undefined);
        }
      );

      dispatch(updateChatHistoryThunk);
      dispatch(updateChatListThunk);

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
        className="chat-form relative"
        labelCol={{ style: { width: 200 } }}
        onFinish={onSendMessage}
        onSubmitCapture={() => form.setFields([{ name: 'response', errors: [], warnings: [] }])}
        form={form}
        onKeyDown={(e) => !e.ctrlKey && e.key === 'Enter' && form.submit()}
        disabled={isSendMessageLoading}
        style={{ flexGrow: 1 }}
      >
        <Form.Item
          {...formDefaultLayout}
          style={{ marginBottom: 0 }}
          name="response"
          className="response-form-item"
        >
          <Form.Item
            {...formDefaultLayout}
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
            {...formDefaultLayout}
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
          <Form.Item {...formDefaultLayout} name="isCustomPreview" label={t('CUSTOM_PREVIEW')}>
            <Flex gap={8}>
              <Form.Item name="isCustomPreview" noStyle valuePropName="checked">
                <Switch />
              </Form.Item>
              <Tooltip
                title={t('CUSTOM_PREVIEW_TOOLTIP')}
                placement="right"
                overlayStyle={{ maxWidth: 250 }}
              >
                <InfoCircleOutlined style={{ cursor: 'pointer' }} />
              </Tooltip>
            </Flex>
          </Form.Item>
          {isCustomPreview && (
            <>
              <Form.Item
                {...formDefaultLayout}
                name={['customPreview', 'title']}
                key="customPreviewTitle"
                label={t('TITLE')}
                required
              >
                <TextArea />
              </Form.Item>
              <Form.Item
                {...formDefaultLayout}
                name={['customPreview', 'description']}
                key="customPreviewDescription"
                label={t('DESCRIPTION')}
                required
              >
                <TextArea />
              </Form.Item>
              <PreviewImageInput
                namePrefix={['customPreview']}
                form={form}
                isBigPreview={isBigPreview}
              />
            </>
          )}
          <Form.Item style={{ marginBottom: 0 }} {...formDefaultLayout}>
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
        </Form.Item>
      </Form>
      <Preview messageFormValues={messageFormValues} />
    </Flex>
  );
};

export default PreviewedMessageForm;
