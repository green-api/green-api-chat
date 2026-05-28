import { FC, MouseEvent, useCallback, useEffect, useRef, useState } from 'react';

import { SendOutlined } from '@ant-design/icons';
import { Button, Flex, Form } from 'antd';
import { useTranslation } from 'react-i18next';

import { ReplyMessage } from 'components/full-chat/user-side/chats/reply-message.component';
import SelectSendingMode from 'components/UI/select/select-sending-mode.component';
import TextArea from 'components/UI/text-area.component';
import { useActions, useAppDispatch, useAppSelector, useFormWithLanguageValidation } from 'hooks';
import { useSendMessageMutation } from 'services/green-api/endpoints';
import { journalsGreenApiEndpoints } from 'services/green-api/endpoints/journals.green-api.endpoints';
import {
  selectActiveChat,
  selectReplyMessage,
  selectMessageCount,
  selectMiniVersion,
} from 'store/slices/chat.slice';
import { selectInstance } from 'store/slices/instances.slice';
import { selectPlatform } from 'store/slices/user.slice';
import { ActiveChat, ChatFormValues, MessageInterface } from 'types';
import { applyMessageFormat, MessageFormat, updateAllChats } from 'utils';

type MessageFormatMenuState = {
  isOpen: boolean;
  x: number;
  y: number;
  selectionStart: number;
  selectionEnd: number;
};

const initialFormatMenuState: MessageFormatMenuState = {
  isOpen: false,
  x: 0,
  y: 0,
  selectionStart: 0,
  selectionEnd: 0,
};

const messageFormatOptions: { key: MessageFormat; translationKey: string }[] = [
  { key: 'bold', translationKey: 'MESSAGE_FORMAT_BOLD' },
  { key: 'italic', translationKey: 'MESSAGE_FORMAT_ITALIC' },
  { key: 'strikethrough', translationKey: 'MESSAGE_FORMAT_STRIKETHROUGH' },
  { key: 'monospace', translationKey: 'MESSAGE_FORMAT_MONOSPACE' },
];

const getMessageTextAreaElement = () =>
  document.querySelector<HTMLTextAreaElement>('textarea.chat-form__message-textarea');

const ChatForm: FC = () => {
  const instanceCredentials = useAppSelector(selectInstance);
  const activeChat = useAppSelector(selectActiveChat) as ActiveChat;
  const isMiniVersion = useAppSelector(selectMiniVersion);
  const messageCount = useAppSelector(selectMessageCount);
  const platform = useAppSelector(selectPlatform);
  const replyMessage = useAppSelector(selectReplyMessage);

  const { setReplyMessage } = useActions();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const [sendMessage, { isLoading: isSendMessageLoading }] = useSendMessageMutation();

  const [form] = useFormWithLanguageValidation<ChatFormValues>();
  const responseTimerReference = useRef<number | null>(null);

  const [inputValue, setInputValue] = useState('');
  const [formatMenu, setFormatMenu] = useState<MessageFormatMenuState>(initialFormatMenuState);

  const closeFormatMenu = useCallback(() => {
    setFormatMenu((currentFormatMenu) =>
      currentFormatMenu.isOpen ? initialFormatMenuState : currentFormatMenu
    );
  }, []);

  const onSendMessage = async (values: ChatFormValues) => {
    const { message } = values;

    if (!message) {
      return;
    }

    const body = {
      ...instanceCredentials,
      chatId: activeChat.chatId,
      message,
    };

    if (replyMessage?.idMessage) {
      Object.assign(body, { quotedMessageId: replyMessage.idMessage });
    }

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

          const newMessage = {
            type: 'outgoing' as const,
            typeMessage: 'textMessage' as const,
            textMessage: message,
            timestamp: Math.floor(Date.now() / 1000),
            senderName: activeChat.senderName || '',
            senderContactName: activeChat.senderContactName || '',
            idMessage: data.idMessage,
            chatId: activeChat.chatId,
            statusMessage: 'sent' as const,
          };

          if (replyMessage?.idMessage) {
            Object.assign(newMessage, {
              quotedMessage: {
                stanzaId: replyMessage.idMessage,
                participant: JSON.parse(replyMessage?.jsonMessage).chatId,
                textMessage: replyMessage.textMessage,
              },
              typeMessage: 'extendedTextMessage',
            });
          }

          draftChatHistory.push(newMessage);

          return draftChatHistory;
        }
      );

      const updateChatListThunk = journalsGreenApiEndpoints.util?.updateQueryData(
        'lastMessages',
        { allMessages: true, ...instanceCredentials },
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

          return updateAllChats(draftChatHistory, [newMessage], []);
        }
      );

      dispatch(updateChatHistoryThunk);
      dispatch(updateChatListThunk);

      form.resetFields();
      setInputValue('');
      setReplyMessage(null);

      setTimeout(() => getMessageTextAreaElement()?.focus(), 100);

      responseTimerReference.current = setTimeout(() => {
        form.setFields([{ name: 'response', errors: [], warnings: [] }]);
      }, 5000);
    }
  };

  const onInputChange = useCallback((value: string) => {
    setInputValue(value);
  }, []);

  const onTextAreaContextMenu = useCallback(
    (event: MouseEvent<HTMLTextAreaElement>) => {
      const textArea = getMessageTextAreaElement();
      const selectionStart = textArea?.selectionStart ?? 0;
      const selectionEnd = textArea?.selectionEnd ?? 0;

      if (selectionStart === selectionEnd) {
        closeFormatMenu();
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const menuWidth = 210;
      const menuHeight = 170;
      const viewportPadding = 8;

      setFormatMenu({
        isOpen: true,
        x: Math.max(
          viewportPadding,
          Math.min(event.clientX, window.innerWidth - menuWidth - viewportPadding)
        ),
        y: Math.max(
          viewportPadding,
          Math.min(event.clientY, window.innerHeight - menuHeight - viewportPadding)
        ),
        selectionStart,
        selectionEnd,
      });
    },
    [closeFormatMenu]
  );

  const onSelectMessageFormat = useCallback(
    (event: MouseEvent<HTMLButtonElement>, format: MessageFormat) => {
      event.preventDefault();
      event.stopPropagation();

      const textArea = getMessageTextAreaElement();
      const currentValue = form.getFieldValue('message') || textArea?.value || '';

      const formattedMessage = applyMessageFormat(
        currentValue,
        formatMenu.selectionStart,
        formatMenu.selectionEnd,
        format
      );

      form.setFieldValue('message', formattedMessage.value);
      setInputValue(formattedMessage.value);
      closeFormatMenu();

      window.requestAnimationFrame(() => {
        textArea?.focus();
        textArea?.setSelectionRange(formattedMessage.selectionStart, formattedMessage.selectionEnd);
      });
    },
    [closeFormatMenu, form, formatMenu.selectionEnd, formatMenu.selectionStart]
  );

  useEffect(() => {
    form.setFields([{ name: 'message', errors: [] }]);
  }, [activeChat.chatId, form]);

  useEffect(() => {
    if (platform === 'web') {
      getMessageTextAreaElement()?.focus();
    }
  });

  useEffect(() => {
    if (!formatMenu.isOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeFormatMenu();
      }
    };

    window.addEventListener('mousedown', closeFormatMenu);
    window.addEventListener('resize', closeFormatMenu);
    window.addEventListener('scroll', closeFormatMenu, true);
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('mousedown', closeFormatMenu);
      window.removeEventListener('resize', closeFormatMenu);
      window.removeEventListener('scroll', closeFormatMenu, true);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [closeFormatMenu, formatMenu.isOpen]);

  return (
    <Form
      name="chat-form"
      className="chat-form bg-color-second relative"
      onFinish={onSendMessage}
      onSubmitCapture={() => form.setFields([{ name: 'response', errors: [], warnings: [] }])}
      form={form}
      onKeyDown={(e) => !e.ctrlKey && e.key === 'Enter' && form.submit()}
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
            <TextArea
              className="chat-form__message-textarea"
              onChange={onInputChange}
              onContextMenu={onTextAreaContextMenu}
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
              htmlType="submit"
              size="large"
              className="login-form-button"
              loading={isSendMessageLoading}
            >
              <SendOutlined />
            </Button>
          </Form.Item>
        </Flex>
      </Form.Item>

      {formatMenu.isOpen && (
        <div
          className="message-format-menu"
          style={{
            position: 'fixed',
            left: formatMenu.x,
            top: formatMenu.y,
            zIndex: 9999,
          }}
          onContextMenu={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
          onMouseDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="message-format-menu__main">
            {messageFormatOptions.map((option) => (
              <button
                className="message-format-menu__item"
                key={option.key}
                type="button"
                onClick={(event) => onSelectMessageFormat(event, option.key)}
              >
                {t(option.translationKey)}
              </button>
            ))}
          </div>
        </div>
      )}
    </Form>
  );
};

export default ChatForm;
