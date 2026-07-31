import { FC } from 'react';

import { CloseOutlined } from '@ant-design/icons';
import { Flex, Space } from 'antd';
import { Header } from 'antd/es/layout/layout';
import { useTranslation } from 'react-i18next';

import waChatIcon from 'assets/wa-chat.svg';
import AvatarImage from 'components/UI/avatar-image.component';
import { FULL_CHAT_HISTORY_COUNT } from 'configs';
import { useActions, useAppSelector } from 'hooks';
import { useGetChatHistoryQuery, useGetChatsQuery } from 'services/green-api/endpoints';
import { selectActiveChat, selectType } from 'store/slices/chat.slice';
import { selectInstance, selectTypeInstance } from 'store/slices/instances.slice';
import { ActiveChat } from 'types';
import { getFirstNonEmptyString, isBotChatType, isWhatsAppOfficialChat } from 'utils';

const ContactChatHeader: FC = () => {
  const activeChat = useAppSelector(selectActiveChat) as ActiveChat;
  const type = useAppSelector(selectType);
  const instanceCredentials = useAppSelector(selectInstance);
  const typeInstance = useAppSelector(selectTypeInstance);
  const { t } = useTranslation();

  const { setActiveChat, setContactInfoOpen } = useActions();

  const isOfficial = isWhatsAppOfficialChat(activeChat.chatId);
  const isBotChat = isBotChatType(activeChat.chatType);
  const { data: chats } = useGetChatsQuery(instanceCredentials, {
    skip:
      typeInstance !== 'telegram' ||
      !instanceCredentials?.idInstance ||
      !instanceCredentials?.apiTokenInstance,
  });
  const { data: chatHistory } = useGetChatHistoryQuery(
    {
      ...instanceCredentials,
      chatId: activeChat.chatId,
      // Must match the count requested by ChatView so RTK Query dedupes both hooks
      // into a single getChatHistory request instead of firing a second parallel one.
      count: FULL_CHAT_HISTORY_COUNT,
    },
    {
      skip:
        !activeChat?.chatId ||
        !instanceCredentials?.idInstance ||
        !instanceCredentials?.apiTokenInstance,
    }
  );
  const telegramChat = chats?.find((chat) => chat.chatId === activeChat.chatId);
  const historySenderName = chatHistory?.find((message) =>
    getFirstNonEmptyString(message.senderName, message.senderContactName)
  );
  const displayName = getFirstNonEmptyString(
    telegramChat?.name,
    activeChat.senderName,
    historySenderName?.senderContactName,
    historySenderName?.senderName,
    activeChat.chatId
  );

  return (
    <Header className="contact-chat-header">
      <Space className="chatHeader-space" onClick={() => setContactInfoOpen(true)}>
        <AvatarImage src={isOfficial ? waChatIcon : activeChat.avatar} size="large" />
        <Flex vertical style={{ minWidth: 0, justifyContent: 'center' }} gap={0}>
          <h3
            className="text-overflow"
            style={{ marginBottom: 0, lineHeight: 1.1 }}
            title={displayName}
          >
            {isOfficial ? 'WhatsApp' : displayName}
          </h3>
          {isBotChat && (
            <div
              className="message-signerData"
              style={{ fontSize: 12, lineHeight: '12px', marginTop: 2, opacity: 0.7 }}
            >
              {t('BOT_LABEL')}
            </div>
          )}
        </Flex>
      </Space>

      <Space>
        {!isOfficial && activeChat.chatId?.includes('@c') && (
          <span>{activeChat.chatId?.replace(/\@.*$/, '')}</span>
        )}
        {type !== 'one-chat-only' && (
          <a>
            <CloseOutlined style={{ width: 13 }} onClick={() => setActiveChat(null)} />
          </a>
        )}
      </Space>
    </Header>
  );
};

export default ContactChatHeader;
