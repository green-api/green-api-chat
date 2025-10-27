import { FC, useEffect, useMemo, useRef, useState } from 'react';

import { Alert, Button, Empty, Spin } from 'antd';
import { useTranslation } from 'react-i18next';

import Message from './message/message.component';
import LeftGroupAlert from 'components/alerts/left-group-alert.component';
import { useActions, useAppSelector } from 'hooks';
import { useIsMaxInstance } from 'hooks/use-is-max-instance';
import { useGetProfileSettingsQuery } from 'services/app/endpoints';
import { useGetChatHistoryQuery, useGetTemplatesQuery } from 'services/green-api/endpoints';
import { selectActiveChat, selectMiniVersion } from 'store/slices/chat.slice';
import { selectInstance } from 'store/slices/instances.slice';
import { selectUser } from 'store/slices/user.slice';
import {
  ActiveChat,
  LanguageLiteral,
  ParsedWabaTemplateInterface,
  TemplateButtonTypesEnum,
} from 'types';
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
  const { idUser, apiTokenUser, projectId } = useAppSelector(selectUser);
  const instanceCredentials = useAppSelector(selectInstance);
  const activeChat = useAppSelector(selectActiveChat) as ActiveChat;
  const isMiniVersion = useAppSelector(selectMiniVersion);

  const [count, setCount] = useState(50);
  const { setMessageCount } = useActions();
  const isMax = useIsMaxInstance();

  let previousMessageAreOutgoing = false;
  let previousSenderName = '';

  const {
    t,
    i18n: { resolvedLanguage },
  } = useTranslation();

  const chatViewRef = useRef<HTMLDivElement | null>(null);
  const scrollPositionRef = useRef<{ top: number; height: number } | null>(null);

  const { data: profileSettings } = useGetProfileSettingsQuery(
    { idUser, apiTokenUser, projectId },
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

  useEffect(() => {
    setMessageCount(50);
  }, [activeChat]);

  const handleLoadMore = () => {
    if (count >= 200) return;

    const element = chatViewRef.current;
    if (!element) return;

    scrollPositionRef.current = {
      top: element.scrollTop,
      height: element.scrollHeight,
    };

    setCount((prev) => {
      const next = Math.min(prev + 20, 200);
      setMessageCount(next);
      return next;
    });
  };

  useEffect(() => {
    const element = chatViewRef.current;
    if (!element || !scrollPositionRef.current) return;

    const heightDiff = element.scrollHeight - scrollPositionRef.current.height;

    element.scrollTop = scrollPositionRef.current.top + heightDiff;

    scrollPositionRef.current = null;
  }, [messages]);

  useEffect(() => {
    const element = chatViewRef.current;
    if (element && count === 50 && !scrollPositionRef.current) {
      setTimeout(() => {
        element.scrollTo({ top: element.scrollHeight, behavior: 'smooth' });
      }, 10);
    }
  }, [count, templates]);

  const loaderVisible = !isMiniVersion && isFetching;

  const formattedMessages = useMemo(() => {
    if (!messages) return [];

    const allFormatted = formatMessages(messages, resolvedLanguage as LanguageLiteral);

    const pollUpdateMap = new Map<string, (typeof messages)[number]>();

    for (const msg of allFormatted) {
      if ('typeMessage' in msg && msg.typeMessage === 'pollUpdateMessage') {
        const stanzaId = msg.pollMessageData?.stanzaId;
        if (!stanzaId) continue;
        const existing = pollUpdateMap.get(stanzaId);
        if (!existing || msg.timestamp > existing.timestamp) {
          pollUpdateMap.set(stanzaId, msg);
        }
      }
    }

    const processedMessages = allFormatted
      .filter((msg) => {
        return !('typeMessage' in msg) || msg.typeMessage !== 'pollUpdateMessage';
      })
      .map((msg) => {
        if ('typeMessage' in msg && msg.typeMessage === 'pollMessage') {
          const update = pollUpdateMap.get(msg.idMessage);
          if (update) {
            return {
              ...msg,
              pollMessageData: {
                name: msg.pollMessageData?.name ?? '',
                options: msg.pollMessageData?.options ?? [],
                multipleAnswers: msg.pollMessageData?.multipleAnswers ?? false,
                votes: update.pollMessageData?.votes || [],
              },
            };
          }
        }
        return msg;
      });

    return processedMessages;
  }, [messages, resolvedLanguage]);

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
    <div className={`chat-view ${isMiniVersion ? '' : 'full'}`} ref={chatViewRef}>
      {count < 200 ? (
        <div style={{ textAlign: 'center', padding: '12px 0' }}>
          <Button onClick={handleLoadMore}>{t('LOAD_MORE_MESSAGES')}</Button>
        </div>
      ) : (
        <Alert
          style={{ textAlign: 'center' }}
          message={t('CHAT_MESSAGE_LIMIT_REACHED_TITLE')}
          type="warning"
        />
      )}

      <Spin size="large" style={{ visibility: loaderVisible ? 'initial' : 'hidden' }} />

      {formattedMessages.map((message, idx) => {
        if (isMessagesDate(message)) {
          return (
            <div
              className="message date p-10"
              key={message.date}
              style={{ alignSelf: 'center' }}
              data-message-id={`date-${message.date}`}
            >
              {message.date.toUpperCase()}
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
        let interactiveButtonsMessage: ParsedWabaTemplateInterface | undefined;

        if (message.templateMessage && !isMiniVersion) {
          if (isOutgoingTemplateMessage(message.templateMessage, message.type)) {
            const id = message.templateMessage.templateId;
            const templateData = templates?.templates.find(
              (template) => template.templateId === id
            );
            if (templateData && templateData.containerMeta) {
              templateMessage = JSON.parse(
                templateData.containerMeta
              ) as ParsedWabaTemplateInterface;
              templateMessage.params = message.templateMessage.params;
            }
          } else {
            if (message.templateMessage.contentText) {
              templateMessage = {
                header: message.templateMessage.titleText,
                data: message.templateMessage.contentText,
                footer: message.templateMessage.footerText,
                mediaUrl: message.templateMessage.mediaUrl,
                buttons: message.templateMessage.buttons?.map((button) => {
                  if (button.callButton) {
                    return {
                      text: button.callButton.displayText,
                      value: button.callButton.displayText,
                      type: TemplateButtonTypesEnum.PhoneNumber,
                    };
                  } else if (button.urlButton) {
                    return {
                      text: button.urlButton.displayText,
                      value: button.urlButton.displayText,
                      type: TemplateButtonTypesEnum.Url,
                    };
                  } else if (button.quickReplyButton) {
                    return {
                      text: button.quickReplyButton.displayText,
                      value: button.quickReplyButton.displayText,
                      type: TemplateButtonTypesEnum.Url,
                    };
                  }
                  return { text: '', value: '', type: TemplateButtonTypesEnum.Url };
                }),
              };
            }
          }
        }

        if (message.interactiveButtons && !isMiniVersion) {
          interactiveButtonsMessage = {
            header: message.interactiveButtons.titleText,
            data: message.interactiveButtons.contentText,
            footer: message.interactiveButtons.footerText,
            buttons: message.interactiveButtons.buttons?.map((button) => {
              if (button.type === 'call') {
                return {
                  text: button.buttonText,
                  value: button.phoneNumber ?? '',
                  type: TemplateButtonTypesEnum.PhoneNumber,
                };
              } else if (button.type === 'url') {
                return {
                  text: button.buttonText,
                  value: button.url ?? '',
                  type: TemplateButtonTypesEnum.Url,
                };
              } else if (button.type === 'reply') {
                return {
                  text: button.buttonText,
                  value: button.buttonId ?? '',
                  type: TemplateButtonTypesEnum.QuickReply,
                };
              } else if (button.type === 'copy') {
                return {
                  text: button.buttonText,
                  value: button.copyCode ?? '',
                  type: TemplateButtonTypesEnum.CopyCode,
                };
              }
              return { text: '', value: '', type: TemplateButtonTypesEnum.Url };
            }),
          };
        }

        return (
          <Message
            key={message.idMessage}
            messageDataForRender={{
              idMessage: message.idMessage,
              showSenderName,
              type: message.type,
              typeMessage,
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
              interactiveButtonsMessage: interactiveButtonsMessage,
              caption: message.caption,
              fileName: message.fileName,
              isDeleted: message.isDeleted,
              isEdited: message.isEdited,
              pollMessageData: message.pollMessageData,
            }}
          />
        );
      })}

      {activeChat.contactInfo === (isMax ? 'groupId not found' : 'Error:forbiden') && (
        <LeftGroupAlert />
      )}
    </div>
  );
};

export default ChatView;
