import { FC, useEffect, useRef } from 'react';

import { Card, Empty, Spin } from 'antd';
import { useTranslation } from 'react-i18next';

import Message from './message.component';
import { useAppSelector } from 'hooks';
import { useGetChatHistoryQuery } from 'services/green-api/endpoints';
import { selectActiveChat } from 'store/slices/chat.slice';
import { selectCredentials } from 'store/slices/user.slice';
import { getErrorMessage, getJSONMessage } from 'utils';

const ChatView: FC = () => {
  const userCredentials = useAppSelector(selectCredentials);
  const activeChat = useAppSelector(selectActiveChat);

  let previousMessageAreOutgoing = false;
  let previousSenderName = '';

  const { t } = useTranslation();

  const chatViewRef = useRef<HTMLDivElement>(null);

  const {
    data: messages,
    isLoading,
    error,
  } = useGetChatHistoryQuery(
    {
      idInstance: userCredentials.idInstance,
      apiTokenInstance: userCredentials.apiTokenInstance,
      chatId: activeChat.chatId,
      count: 10,
    },
    { skipPollingIfUnfocused: true, pollingInterval: 15000 }
  );

  useEffect(() => {
    const element = chatViewRef.current;
    if (element) {
      element.scrollTop = element.scrollHeight;
    }
  }, [messages]);

  if (isLoading) {
    return (
      <Card className="chat-view flex-center" bordered={false} style={{ boxShadow: 'unset' }}>
        <Spin size="large" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="chat-view flex-center" bordered={false} style={{ boxShadow: 'unset' }}>
        <Empty description={getErrorMessage(error, t)} />
      </Card>
    );
  }

  return (
    <Card className="chat-view scroll-bar" bordered={false} style={{ boxShadow: 'unset' }} ref={chatViewRef}>
      {messages?.map((message, idx) => {
        const typeMessage = message.typeMessage;
        const showSenderName =
          (previousSenderName !== message.senderName &&
            previousSenderName !== message.senderId &&
            message.type !== 'outgoing') ||
          (message.type === 'outgoing' && !previousMessageAreOutgoing);

        previousMessageAreOutgoing = message.type === 'outgoing';
        previousSenderName = message.senderName || message.senderId || '';

        return (
          <Message
            key={message.idMessage}
            showSenderName={showSenderName}
            type={message.type}
            typeMessage={typeMessage}
            textMessage={
              !typeMessage.toLowerCase().includes('text')
                ? typeMessage
                : message.extendedTextMessage?.text || message.textMessage || message.typeMessage
            }
            senderName={message.type === 'outgoing' ? t('YOU_SENDER_NAME') : message.senderName!}
            phone={message.senderId?.replace(/\@.*$/, '')}
            isLastMessage={idx === messages?.length - 1}
            timestamp={message.timestamp}
            jsonMessage={getJSONMessage(message)}
            downloadUrl={message.downloadUrl}
            statusMessage={message.statusMessage}
          />
        );
      })}
    </Card>
  );
};

export default ChatView;
