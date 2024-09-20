import { FC, useEffect, useRef, useState } from 'react';

import { Card, Empty, Spin } from 'antd';
import { useTranslation } from 'react-i18next';

import Message from './message.component';
import { useActions, useAppSelector } from 'hooks';
import { useGetChatHistoryQuery } from 'services/green-api/endpoints';
import { selectActiveChat, selectMiniVersion } from 'store/slices/chat.slice';
import { selectCredentials } from 'store/slices/user.slice';
import { ActiveChat } from 'types';
import { getErrorMessage, getJSONMessage } from 'utils';

const ChatView: FC = () => {
  const userCredentials = useAppSelector(selectCredentials);
  const activeChat = useAppSelector(selectActiveChat) as ActiveChat;
  const isMiniVersion = useAppSelector(selectMiniVersion);

  const [count, setCount] = useState(20);
  const { setMessageCount } = useActions();

  let previousMessageAreOutgoing = false;
  let previousSenderName = '';

  const { t } = useTranslation();

  const chatViewRef = useRef<HTMLDivElement>(null);

  const setPageTimerReference = useRef<ReturnType<typeof setTimeout>>();
  const {
    data: messages,
    isLoading,
    isFetching,
    error,
  } = useGetChatHistoryQuery(
    {
      idInstance: userCredentials.idInstance,
      apiTokenInstance: userCredentials.apiTokenInstance,
      chatId: activeChat.chatId,
      count: isMiniVersion ? 10 : count,
    },
    { skipPollingIfUnfocused: true, pollingInterval: 15000 }
  );

  // scroll to bottom when open chat
  useEffect(() => {
    const element = chatViewRef.current;
    if (element && count === 20) {
      element.scrollTo({ top: element.scrollHeight });
    }
  }, [messages]);

  // scroll top handler
  useEffect(() => {
    const element = chatViewRef.current;
    if (!element || isMiniVersion) {
      return;
    }

    let timer: number;

    const handleScrollTop = () => {
      if (element.scrollTop === 0 && element.scrollHeight > element.clientHeight && count < 180) {
        clearTimeout(setPageTimerReference.current);
        clearTimeout(timer);

        setPageTimerReference.current = setTimeout(() => {
          setMessageCount(count + 10);
          setCount((count) => count + 10);
          timer = setTimeout(() => element.scrollTo({ top: element.clientHeight / 5 }), 350);
        }, 500);
      }
    };

    element.addEventListener('scroll', handleScrollTop);

    return () => element.removeEventListener('scroll', handleScrollTop);
  }, [messages]);

  if (isLoading) {
    return (
      <Card
        className={`chat-view flex-center ${isMiniVersion ? '' : 'chat-bg full'}`}
        bordered={false}
        style={{ boxShadow: 'unset' }}
      >
        <Spin size="large" />
      </Card>
    );
  }

  if (error) {
    if ('status' in error && error.status === 429) {
      return (
        <Card
          className={`chat-view flex-center ${isMiniVersion ? '' : 'chat-bg full'}`}
          bordered={false}
          style={{ boxShadow: 'unset' }}
        >
          <Spin size="large" />
        </Card>
      );
    }

    return (
      <Card
        className={`chat-view flex-center ${isMiniVersion ? '' : 'full'}`}
        bordered={false}
        style={{ boxShadow: 'unset' }}
      >
        <Empty description={getErrorMessage(error, t)} />
      </Card>
    );
  }

  return (
    <Card
      className={`chat-view ${isMiniVersion ? '' : 'chat-bg full'}`}
      bordered={false}
      style={{ boxShadow: 'unset' }}
      ref={chatViewRef}
    >
      {isFetching &&
        chatViewRef.current?.scrollTop === 0 &&
        chatViewRef.current?.scrollHeight > chatViewRef.current?.clientHeight && (
          <Spin size="large" />
        )}
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
