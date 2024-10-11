import { FC, SyntheticEvent, useEffect, useRef, useState } from 'react';

import { Empty, Spin } from 'antd';
import { useTranslation } from 'react-i18next';

import Message from './message/message.component';
import { useActions, useAppSelector } from 'hooks';
import { useGetChatHistoryQuery } from 'services/green-api/endpoints';
import { selectActiveChat, selectMiniVersion } from 'store/slices/chat.slice';
import { selectInstance } from 'store/slices/instances.slice';
import { ActiveChat } from 'types';
import { getErrorMessage, getJSONMessage, getPhoneNumberFromChatId, getTextMessage } from 'utils';

const ChatView: FC = () => {
  const userCredentials = useAppSelector(selectInstance);
  const activeChat = useAppSelector(selectActiveChat) as ActiveChat;
  const isMiniVersion = useAppSelector(selectMiniVersion);

  const [count, setCount] = useState(30);
  const { setMessageCount } = useActions();

  let previousMessageAreOutgoing = false;
  let previousSenderName = '';

  const { t } = useTranslation();

  const chatViewRef = useRef<HTMLDivElement | null>(null);

  const setPageTimerReference = useRef<ReturnType<typeof setTimeout>>();
  const scrollTimerReference = useRef<ReturnType<typeof setTimeout>>();

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

  const [scrollHeight, setScrollHeight] = useState(0);

  const handleScrollTop = (event: SyntheticEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;

    if (!target || isMiniVersion) {
      return;
    }

    if (target.scrollTop === 0 && target.scrollHeight > target.clientHeight && count < 180) {
      clearTimeout(setPageTimerReference.current);
      clearTimeout(scrollTimerReference.current);

      setPageTimerReference.current = setTimeout(() => {
        setMessageCount(count + 10);
        setCount((count) => count + 10);
        scrollTimerReference.current = setTimeout(
          () => target.scrollTo({ top: target.scrollHeight - scrollHeight }),
          350
        );
      }, 500);
    }
  };

  // reset global message count
  useEffect(() => {
    setMessageCount(30);
  }, [activeChat, activeChat.chatId]);

  // scroll to bottom when open chat
  useEffect(() => {
    const element = chatViewRef.current;
    if (element && count === 30) {
      element.scrollTo({ top: element.scrollHeight });
    }
  }, [messages]);

  if (isLoading) {
    return (
      <div className={`chat-view flex-center ${isMiniVersion ? '' : 'full'}`}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    if ('status' in error && error.status === 429) {
      return (
        <div className={`chat-view flex-center ${isMiniVersion ? '' : 'full'}`}>
          <Spin size="large" />
        </div>
      );
    }

    return (
      <div className={`chat-view flex-center ${isMiniVersion ? '' : 'full'}`}>
        <Empty description={getErrorMessage(error, t)} />
      </div>
    );
  }

  return (
    <div
      className={`chat-view ${isMiniVersion ? '' : 'full'}`}
      ref={(node) => {
        chatViewRef.current = node;

        if (node) {
          setScrollHeight(node.scrollHeight);
        }
      }}
      onScroll={handleScrollTop}
    >
      {!isMiniVersion &&
        count < 180 &&
        isFetching &&
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
            textMessage={getTextMessage(message)}
            senderName={message.type === 'outgoing' ? t('YOU_SENDER_NAME') : message.senderName!}
            phone={message.senderId && getPhoneNumberFromChatId(message.senderId)}
            isLastMessage={idx === messages?.length - 1}
            timestamp={message.timestamp}
            jsonMessage={getJSONMessage(message)}
            downloadUrl={message.downloadUrl}
            statusMessage={message.statusMessage}
            quotedMessage={message.quotedMessage}
          />
        );
      })}
    </div>
  );
};

export default ChatView;
