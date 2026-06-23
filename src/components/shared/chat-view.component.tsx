import { FC, useEffect, useMemo, useRef, useState } from 'react';

import { Alert, Button, Empty, Spin } from 'antd';
import { useTranslation } from 'react-i18next';

import Message from './message/message.component';
import LeftGroupAlert from 'components/alerts/left-group-alert.component';
import { useActions, useAppSelector } from 'hooks';
import { useIsMaxInstance } from 'hooks/use-is-max-instance';
import { useIsWabaInstance } from 'hooks/use-is-waba-instance';
import { useGetChatHistoryQuery, useGetTemplatesQuery } from 'services/green-api/endpoints';
import { selectActiveChat, selectMiniVersion } from 'store/slices/chat.slice';
import { selectInstance } from 'store/slices/instances.slice';
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
  const instanceCredentials = useAppSelector(selectInstance);
  const activeChat = useAppSelector(selectActiveChat) as ActiveChat;
  const isMiniVersion = useAppSelector(selectMiniVersion);

  const [count, setCount] = useState(50);
  const { setMessageCount } = useActions();
  const isMax = useIsMaxInstance();
  const isWaba = useIsWabaInstance();

  let previousMessageAreOutgoing = false;
  let previousSenderName = '';

  const {
    t,
    i18n: { resolvedLanguage },
  } = useTranslation();

  const chatViewRef = useRef<HTMLDivElement | null>(null);
  const scrollPositionRef = useRef<{ top: number; height: number } | null>(null);

  const { data: templates, isLoading: templatesLoading } = useGetTemplatesQuery(
    instanceCredentials,
    {
      skip: !isWaba,
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

  const getReactionTargetId = (msg: Record<string, unknown>): string | undefined => {
    const quoted = msg.quotedMessage as { stanzaId?: string } | undefined;
    const templateReply = msg.templateButtonReplyMessage as { stanzaId?: string } | undefined;
    const ext = msg.extendedTextMessage as
      | { contextInfo?: { stanzaId?: string; quotedMessage?: { stanzaId?: string } } }
      | undefined;

    return (
      quoted?.stanzaId ||
      templateReply?.stanzaId ||
      ext?.contextInfo?.stanzaId ||
      ext?.contextInfo?.quotedMessage?.stanzaId
    );
  };

  const getReactionEmoji = (msg: Record<string, unknown>): string | undefined => {
    const extData = msg.extendedTextMessageData as { text?: string } | undefined;
    const ext = msg.extendedTextMessage as { text?: string } | undefined;
    const text = msg.textMessage;

    if (typeof extData?.text === 'string' && extData.text.trim()) return extData.text.trim();
    if (typeof ext?.text === 'string' && ext.text.trim()) return ext.text.trim();
    if (typeof text === 'string' && text.trim()) return text.trim();
    return undefined;
  };

  const getReactionKeysForMessage = (msg: Record<string, unknown>): string[] => {
    const keys = new Set<string>();
    const addKey = (value: unknown) => {
      if (typeof value === 'string') {
        const normalized = value.trim();
        if (normalized) keys.add(normalized);
      }
    };

    const idMessage = msg.idMessage;
    addKey(idMessage);

    const ext = msg.extendedTextMessage as { stanzaId?: string } | undefined;
    addKey(ext?.stanzaId);

    const quoted = msg.quotedMessage as { stanzaId?: string } | undefined;
    addKey(quoted?.stanzaId);

    const templateReply = msg.templateButtonReplyMessage as { stanzaId?: string } | undefined;
    addKey(templateReply?.stanzaId);

    return Array.from(keys);
  };

  const formattedMessages = useMemo(() => {
    if (!messages) return [];

    const allFormatted = formatMessages(messages, resolvedLanguage as LanguageLiteral);
    const reactionMap = new Map<string, Map<string, string>>();

    const pollUpdateMap = new Map<
      string,
      Map<string, { timestamp: number; selectedOptions: string[] }>
    >();

    for (const msg of allFormatted) {
      if ('typeMessage' in msg && msg.typeMessage === 'reactionMessage') {
        const targetId = getReactionTargetId(msg as unknown as Record<string, unknown>);
        const reaction = getReactionEmoji(msg as unknown as Record<string, unknown>);
        const senderId =
          typeof msg.senderId === 'string' && msg.senderId.trim()
            ? msg.senderId.trim()
            : msg.type === 'outgoing'
              ? 'outgoing:self'
              : undefined;
        const normalizedTarget = targetId?.trim();
        if (normalizedTarget && reaction && senderId) {
          const existingReactions = reactionMap.get(normalizedTarget) ?? new Map<string, string>();
          existingReactions.set(senderId, reaction);
          reactionMap.set(normalizedTarget, existingReactions);
        }
        continue;
      }

      if ('typeMessage' in msg && msg.typeMessage === 'pollUpdateMessage') {
        const stanzaId = msg.pollMessageData?.stanzaId;
        if (!stanzaId) continue;
        const senderId =
          typeof msg.senderId === 'string' && msg.senderId.trim()
            ? msg.senderId.trim()
            : msg.type === 'outgoing'
              ? 'outgoing:self'
              : undefined;

        if (!senderId) continue;

        const senderPhone = getPhoneNumberFromChatId(senderId);

        const selectedOptions =
          msg.pollMessageData?.votes
            ?.filter((vote) =>
              vote.optionVoters.some(
                (voter) => getPhoneNumberFromChatId(voter) === senderPhone
              )
            )
            .map((vote) => vote.optionName) ?? [];

        const updatesBySender = pollUpdateMap.get(stanzaId) ?? new Map();
        const existing = updatesBySender.get(senderPhone);

        if (!existing || msg.timestamp >= existing.timestamp) {
          updatesBySender.set(senderPhone, { timestamp: msg.timestamp, selectedOptions });
          pollUpdateMap.set(stanzaId, updatesBySender);
        }
      }
    }

    const processedMessages = allFormatted
      .filter((msg) => {
        return (
          !('typeMessage' in msg) ||
          (msg.typeMessage !== 'pollUpdateMessage' && msg.typeMessage !== 'reactionMessage')
        );
      })
      .map((msg) => {
        if ('typeMessage' in msg && msg.typeMessage === 'pollMessage') {
          const updatesBySender = pollUpdateMap.get(msg.idMessage);
          if (updatesBySender) {
            const votesByOption = new Map<string, Set<string>>();

            for (const option of msg.pollMessageData?.options ?? []) {
              votesByOption.set(option.optionName, new Set());
            }

            for (const [senderPhone, update] of updatesBySender.entries()) {
              for (const selectedOption of update.selectedOptions) {
                const optionVoters = votesByOption.get(selectedOption) ?? new Set<string>();
                optionVoters.add(senderPhone);
                votesByOption.set(selectedOption, optionVoters);
              }
            }

            return {
              ...msg,
              pollMessageData: {
                name: msg.pollMessageData?.name ?? '',
                options: msg.pollMessageData?.options ?? [],
                multipleAnswers: msg.pollMessageData?.multipleAnswers ?? false,
                votes: Array.from(votesByOption.entries()).map(([optionName, optionVoters]) => ({
                  optionName,
                  optionVoters: Array.from(optionVoters),
                })),
              },
            };
          }
        }
        return {
          ...msg,
          reactions:
            'idMessage' in msg
              ? (() => {
                  const aggregated = new Map<string, number>();
                  for (const key of getReactionKeysForMessage(
                    msg as unknown as Record<string, unknown>
                  )) {
                    const keyReactions = reactionMap.get(key);
                    if (!keyReactions) continue;
                    for (const emoji of keyReactions.values()) {
                      aggregated.set(emoji, (aggregated.get(emoji) ?? 0) + 1);
                    }
                  }

                  return Array.from(aggregated.entries()).map(([emoji, count]) => ({
                    emoji,
                    count,
                  }));
                })()
              : undefined,
        };
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
              senderType: message.senderType,
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
              reactions: 'reactions' in message ? message.reactions : undefined,
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
