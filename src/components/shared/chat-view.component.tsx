import { FC, SyntheticEvent, useEffect, useMemo, useRef, useState } from 'react';

import { Empty, Spin } from 'antd';
import { useTranslation } from 'react-i18next';

import Message from './message/message.component';
import LeftGroupAlert from 'components/alerts/left-group-alert.component';
import { useActions, useAppSelector } from 'hooks';
import { useGetProfileSettingsQuery } from 'services/app/endpoints';
import { useGetChatHistoryQuery, useGetTemplatesQuery } from 'services/green-api/endpoints';
import { selectActiveChat, selectMiniVersion } from 'store/slices/chat.slice';
import { selectInstance } from 'store/slices/instances.slice';
import { selectUser } from 'store/slices/user.slice';
import { ActiveChat, ParsedWabaTemplateInterface, TemplateButtonTypesEnum } from 'types';
import {
  formatMessages,
  getErrorMessage,
  getJSONMessage,
  getPhoneNumberFromChatId,
  getTextMessage,
  isMessagesDate,
  isOutgoingTemplateMessage,
} from 'utils';

const ChatView: FC = () => {
  const { idUser, apiTokenUser } = useAppSelector(selectUser);
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

  const { data: profileSettings } = useGetProfileSettingsQuery(
    { idUser, apiTokenUser },
    { skip: !idUser || !apiTokenUser }
  );

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
      ...instanceCredentials,
      chatId: activeChat.chatId,
      count: isMiniVersion ? 10 : count,
    },
    {
      skipPollingIfUnfocused: true,
      pollingInterval: 15000,
    }
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
          300
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
      setTimeout(() => {
        element.scrollTo({ top: element.scrollHeight });
      }, 10);
    }
  }, [messages, templates]);

  const loaderVisible =
    !isMiniVersion &&
    count < 180 &&
    isFetching &&
    chatViewRef.current?.scrollTop === 0 &&
    chatViewRef.current?.scrollHeight > chatViewRef.current?.clientHeight;

  const formattedMessages = useMemo(() => {
    if (!messages) return [];

    return formatMessages(messages);
  }, [messages]);

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
      {formattedMessages.map((message, idx) => {
        if (isMessagesDate(message)) {
          return (
            <div key={message.date} style={{ alignSelf: 'center' }}>
              {message.date}
            </div>
          );
        }

        const typeMessage = message.typeMessage;
        const showSenderName =
          (previousSenderName !== message.senderName &&
            previousSenderName !== message.senderId &&
            message.type !== 'outgoing') ||
          (message.type === 'outgoing' && !previousMessageAreOutgoing);

        previousMessageAreOutgoing = message.type === 'outgoing';
        previousSenderName = message.senderName || message.senderId || '';

        let templateMessage: ParsedWabaTemplateInterface | undefined;

        if (message.templateMessage && !isMiniVersion) {
          if (isOutgoingTemplateMessage(message.templateMessage, message.type)) {
            const id = message.templateMessage.templateId;

            const templateData = templates?.templates.find(
              (template) => template.templateId === id
            );

            if (templateData) {
              if (templateData.containerMeta) {
                templateMessage = JSON.parse(
                  templateData.containerMeta
                ) as ParsedWabaTemplateInterface;

                templateMessage.params = message.templateMessage.params;
              }
            }
          } else {
            if (message.templateMessage.contentText) {
              templateMessage = {
                header: message.templateMessage.titleText,
                data: message.templateMessage.contentText,
                footer: message.templateMessage.footerText,
                mediaUrl: message.templateMessage.mediaUrl,
                buttons: message.templateMessage.buttons?.map((incomingBtn) => {
                  if (incomingBtn.callButton) {
                    return {
                      text: incomingBtn.callButton.displayText,
                      value: incomingBtn.callButton.displayText,
                      type: TemplateButtonTypesEnum.PhoneNumber,
                    };
                  } else if (incomingBtn.urlButton) {
                    return {
                      text: incomingBtn.urlButton.displayText,
                      value: incomingBtn.urlButton.displayText,
                      type: TemplateButtonTypesEnum.Url,
                    };
                  } else if (incomingBtn.quickReplyButton) {
                    return {
                      text: incomingBtn.quickReplyButton.displayText,
                      value: incomingBtn.quickReplyButton.displayText,
                      type: TemplateButtonTypesEnum.Url,
                    };
                  }

                  return {
                    text: '',
                    value: '',
                    type: TemplateButtonTypesEnum.Url,
                  };
                }),
              };
            }
          }
        }

        return (
          <Message
            key={message.idMessage}
            messageDataForRender={{
              idMessage: message.idMessage,
              showSenderName: showSenderName,
              type: message.type,
              typeMessage: typeMessage,
              textMessage: getTextMessage(message),
              senderName: message.type === 'outgoing' ? t('YOU_SENDER_NAME') : message.senderName!,
              phone: message.senderId && getPhoneNumberFromChatId(message.senderId),
              isLastMessage: idx === formattedMessages.length - 1,
              timestamp: message.timestamp,
              jsonMessage: getJSONMessage(message),
              downloadUrl: message.downloadUrl,
              statusMessage: message.statusMessage,
              quotedMessage: message.quotedMessage,
              templateMessage: templateMessage,
              caption: message.caption,
              fileName: message.fileName,
              isDeleted: message.isDeleted,
              isEdited: message.isEdited,
            }}
          />
        );
      })}
      {activeChat.contactInfo === 'Error: forbidden' && <LeftGroupAlert />}
    </div>
  );
};

export default ChatView;
