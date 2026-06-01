import { FC, useCallback, useEffect, useRef, useState } from 'react';

import { SendOutlined } from '@ant-design/icons';
import { Button, Flex, Form } from 'antd';
import { useTranslation } from 'react-i18next';

import ChatFormatMenu from 'components/forms/chat-form/chat-format-menu.component';
import ChatLinkModal, {
  LinkModalFormValues,
} from 'components/forms/chat-form/chat-link-modal.component';
import { useChatMessageFormatting } from 'components/forms/chat-form/use-chat-message-formatting.hook';
import { useChatMessageSubmit } from 'components/forms/chat-form/use-chat-message-submit.hook';
import { ReplyMessage } from 'components/full-chat/user-side/chats/reply-message.component';
import ContentEditableTextArea, {
  ContentEditableTextAreaRef,
} from 'components/UI/content-editable-text-area.component';
import SelectSendingMode from 'components/UI/select/select-sending-mode.component';
import { useAppSelector, useFormWithLanguageValidation } from 'hooks';
import { useIsMaxInstance } from 'hooks/use-is-max-instance';
import { useIsTelegramInstance } from 'hooks/use-is-telegram-instance';
import {
  selectActiveChat,
  selectReplyMessage,
  selectMessageCount,
  selectMiniVersion,
} from 'store/slices/chat.slice';
import { selectInstance } from 'store/slices/instances.slice';
import { selectPlatform } from 'store/slices/user.slice';
import { ActiveChat, ChatFormValues } from 'types';

const ChatForm: FC = () => {
  const instanceCredentials = useAppSelector(selectInstance);
  const activeChat = useAppSelector(selectActiveChat) as ActiveChat;
  const isMiniVersion = useAppSelector(selectMiniVersion);
  const messageCount = useAppSelector(selectMessageCount);
  const platform = useAppSelector(selectPlatform);
  const replyMessage = useAppSelector(selectReplyMessage);
  const isMax = useIsMaxInstance();
  const isTelegram = useIsTelegramInstance();
  const isLinkFeatureEnabled = isMax || isTelegram;

  const { t } = useTranslation();

  const [form] = useFormWithLanguageValidation<ChatFormValues>();
  const messageEditorRef = useRef<ContentEditableTextAreaRef>(null);

  const [inputValue, setInputValue] = useState('');
  const [linkForm] = Form.useForm<LinkModalFormValues>();

  const onInputChange = useCallback(
    (value: string) => {
      setInputValue(value);
      form.setFieldValue('message', value);
    },
    [form]
  );

  const { onSendMessage, isSendMessageLoading } = useChatMessageSubmit({
    form,
    instanceCredentials,
    activeChat,
    isMiniVersion,
    messageCount,
    replyMessage,
    setInputValue,
    messageEditorRef,
    t,
  });

  const {
    formatMenu,
    isLinkModalOpen,
    onTextAreaContextMenu,
    onSelectMessageFormat,
    onOpenFormattingSubmenu,
    onBackToFormatMenuRoot,
    onOpenLinkModal,
    onCancelLinkModal,
    onInsertLink,
    onEditorKeyDown,
  } = useChatMessageFormatting({
    form,
    linkForm,
    isLinkFeatureEnabled,
    inputValue,
    setInputValue,
    messageEditorRef,
  });

  useEffect(() => {
    form.setFields([{ name: 'message', errors: [] }]);
  }, [activeChat.chatId, form]);

  useEffect(() => {
    if (platform === 'web') {
      messageEditorRef.current?.focus();
    }
  });

  return (
    <Form
      name="chat-form"
      className="chat-form bg-color-second relative"
      onFinish={onSendMessage}
      onSubmitCapture={() => form.setFields([{ name: 'response', errors: [], warnings: [] }])}
      form={form}
      disabled={isSendMessageLoading}
    >
      <Form.Item style={{ marginBottom: 0 }} name="response" className="response-form-item">
        <ReplyMessage />

        <Flex gap={10} align="center">
          <Flex align="center" justify="center">
            <SelectSendingMode />
          </Flex>

          <Form.Item
            style={{ marginBottom: 0, flex: '1 1 auto' }}
            name="message"
            normalize={(value) => {
              form.setFields([{ name: 'response', warnings: [] }]);
              return value;
            }}
          >
            <ContentEditableTextArea
              ref={messageEditorRef}
              className="chat-form__message-textarea"
              value={inputValue}
              placeholder={t('MESSAGE_PLACEHOLDER')}
              disabled={isSendMessageLoading}
              enableMarkdownLinks={isLinkFeatureEnabled}
              onChange={onInputChange}
              onContextMenu={onTextAreaContextMenu}
              onKeyDown={onEditorKeyDown}
            />
          </Form.Item>

          <Form.Item
            style={{
              marginBottom: 0,
              visibility: inputValue || isMiniVersion ? 'initial' : 'hidden',
            }}
          >
            <Button
              type="link"
              htmlType="button"
              size="large"
              className="login-form-button"
              loading={isSendMessageLoading}
              onClick={() => form.submit()}
            >
              <SendOutlined />
            </Button>
          </Form.Item>
        </Flex>
      </Form.Item>

      <ChatFormatMenu
        isLinkFeatureEnabled={isLinkFeatureEnabled}
        formatMenu={formatMenu}
        onOpenFormattingSubmenu={onOpenFormattingSubmenu}
        onOpenLinkModal={onOpenLinkModal}
        onBackToFormatMenuRoot={onBackToFormatMenuRoot}
        onSelectMessageFormat={onSelectMessageFormat}
      />

      <ChatLinkModal
        isOpen={isLinkFeatureEnabled && isLinkModalOpen}
        form={linkForm}
        onCancel={onCancelLinkModal}
        onOk={onInsertLink}
      />
    </Form>
  );
};

export default ChatForm;
