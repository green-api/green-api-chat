import { FC, SyntheticEvent, useEffect, useRef, useState } from 'react';

import { Empty, Spin } from 'antd';
import { useTranslation } from 'react-i18next';

import Message from './message/message.component';
import TemplateMessage from './message/template-message/template-message.component';
import { useActions, useAppSelector } from 'hooks';
import { useGetProfileSettingsQuery } from 'services/app/endpoints';
import { useGetChatHistoryQuery, useGetTemplatesQuery } from 'services/green-api/endpoints';
import { selectActiveChat, selectMiniVersion } from 'store/slices/chat.slice';
import { selectInstance } from 'store/slices/instances.slice';
import { ActiveChat, ParsedWabaTemplateInterface } from 'types';
import {
  getErrorMessage,
  getJSONMessage,
  getPhoneNumberFromChatId,
  getTextMessage,
  isOutgoingTemplateMessage,
} from 'utils';

const ChatView: FC = () => {
  const instanceCredentials = useAppSelector(selectInstance);
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

  const { data: profileSettings } = useGetProfileSettingsQuery();

  const { data: templates, isLoading: templatesLoading } = useGetTemplatesQuery(
    instanceCredentials,
    {
      skip: !(profileSettings && profileSettings.result && profileSettings.data.isWaba),
    }
  );

  const {
    data: messages,
    isLoading,
    isFetching,
    error,
  } = useGetChatHistoryQuery(
    {
      idInstance: instanceCredentials.idInstance,
      apiTokenInstance: instanceCredentials.apiTokenInstance,
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
  }, [activeChat]);

  // scroll to bottom when open chat
  useEffect(() => {
    const element = chatViewRef.current;
    if (element && count === 30) {
      element.scrollTo({ top: element.scrollHeight });
    }
  }, [messages]);

  const loaderVisible =
    !isMiniVersion &&
    count < 180 &&
    isFetching &&
    chatViewRef.current?.scrollTop === 0 &&
    chatViewRef.current?.scrollHeight > chatViewRef.current?.clientHeight;

  if (isLoading || templatesLoading) {
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
      <Spin size="large" style={{ visibility: loaderVisible ? 'initial' : 'hidden' }} />
      {messages?.map((message, idx) => {
        const typeMessage = message.typeMessage;
        const showSenderName =
          (previousSenderName !== message.senderName &&
            previousSenderName !== message.senderId &&
            message.type !== 'outgoing') ||
          (message.type === 'outgoing' && !previousMessageAreOutgoing);

        previousMessageAreOutgoing = message.type === 'outgoing';
        previousSenderName = message.senderName || message.senderId || '';

        if (
          message.templateMessage &&
          isOutgoingTemplateMessage(message.templateMessage, message.type) &&
          !isMiniVersion &&
          templates
        ) {
          const id = message.templateMessage.templateId;

          const templateData = templates.templates.find((template) => template.templateId === id);

          if (!templateData) {
            return null;
          }

          const parsedTemplateData = JSON.parse(
            templateData.containerMeta
          ) as ParsedWabaTemplateInterface;

          return (
            <TemplateMessage
              key={message.idMessage}
              templateMessage={parsedTemplateData}
              templateType={templateData.templateType}
              timestamp={message.timestamp}
              type={message.type}
              jsonMessage={getJSONMessage(message)}
              params={message.templateMessage.params}
            />
          );
        }

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
