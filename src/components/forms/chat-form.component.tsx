import { FC, useCallback, useEffect, useRef, useState } from 'react';

import { SendOutlined } from '@ant-design/icons';
import { Button, Col, Form, Row } from 'antd';
import { useTranslation } from 'react-i18next';

import TextArea from 'components/UI/text-area.component';
import { useAppDispatch, useAppSelector, useFormWithLanguageValidation } from 'hooks';
import { useSendMessageMutation } from 'services/green-api/endpoints';
import { journalsGreenApiEndpoints } from 'services/green-api/endpoints/journals.green-api.endpoints';
import { selectActiveChat, selectMessageCount, selectMiniVersion } from 'store/slices/chat.slice';
import { selectInstance } from 'store/slices/instances.slice';
import { selectPlatform } from 'store/slices/user.slice';
import { ActiveChat, ChatFormValues, MessageInterface } from 'types';
import { getLastChats } from 'utils';

const ChatForm: FC = () => {
  const instanceCredentials = useAppSelector(selectInstance);
  const activeChat = useAppSelector(selectActiveChat) as ActiveChat;
  const isMiniVersion = useAppSelector(selectMiniVersion);
  const messageCount = useAppSelector(selectMessageCount);
  const platform = useAppSelector(selectPlatform);

  const dispatch = useAppDispatch();

  const { t } = useTranslation();

  const [sendMessage, { isLoading: isSendMessageLoading }] = useSendMessageMutation();

  const [form] = useFormWithLanguageValidation<ChatFormValues>();
  const responseTimerReference = useRef<number | null>(null);

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const [inputValue, setInputValue] = useState('');

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

      setInputValue('');

      setTimeout(() => textAreaRef.current?.focus(), 100);

      responseTimerReference.current = setTimeout(() => {
        form.setFields([{ name: 'response', errors: [], warnings: [] }]);
      }, 5000);
    }
  };

  const onInputChange = useCallback((value: string) => {
    setInputValue(value);
  }, []);

  useEffect(() => {
    form.setFields([{ name: 'message', errors: [] }]);
  }, [activeChat.chatId, form]);

  useEffect(() => {
    if (platform === 'web') {
      textAreaRef.current?.focus();
    }
  });

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
        <Row gutter={[15, 15]} align={isMiniVersion ? 'bottom' : 'middle'}>
          <Col flex="auto">
            <Form.Item
              style={{ marginBottom: 0 }}
              name="message"
              normalize={(value) => {
                form.setFields([{ name: 'response', warnings: [] }]);

                return value;
              }}
            >
              <TextArea ref={textAreaRef} onChange={onInputChange} />
            </Form.Item>
          </Col>
          <Col style={{ visibility: inputValue || isMiniVersion ? 'initial' : 'hidden' }}>
            <Form.Item style={{ marginBottom: 0 }}>
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
          </Col>
        </Row>
      </Form.Item>
    </Form>
  );
};

export default ChatForm;
