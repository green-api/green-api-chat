import { FC, useMemo } from 'react';

import { Flex, List, Skeleton } from 'antd';
import { useTranslation } from 'react-i18next';

import emptyAvatar from 'assets/emptyAvatar.png';
import emptyAvatarButAvailable from 'assets/emptyAvatarButAvailable.svg';
import emptyAvatarGroup from 'assets/emptyAvatarGroup.png';
import AvatarImage from 'components/UI/avatar-image.component';
import { useActions, useAppSelector } from 'hooks';
import {
  useGetAvatarQuery,
  useGetContactInfoQuery,
  useGetGroupDataQuery,
} from 'services/green-api/endpoints';
import { selectActiveChat } from 'store/slices/chat.slice';
import { selectInstance } from 'store/slices/instances.slice';
import { LanguageLiteral, MessageInterface } from 'types';
import {
  getMessageDate,
  getMessageTypeIcon,
  getPhoneNumberFromChatId,
  getOutgoingStatusMessageIcon,
  getTextMessage,
} from 'utils';

interface ContactListItemProps {
  lastMessage: MessageInterface;
}

const ChatListItem: FC<ContactListItemProps> = ({ lastMessage }) => {
  const {
    t,
    i18n: { resolvedLanguage },
  } = useTranslation();

  const instanceCredentials = useAppSelector(selectInstance);
  const activeChat = useAppSelector(selectActiveChat);

  const { setActiveChat } = useActions();

  const messageDate = getMessageDate(
    lastMessage.timestamp * 1000,
    resolvedLanguage as LanguageLiteral
  );

  const { data: groupData, isLoading: isGroupDataLoading } = useGetGroupDataQuery(
    {
      ...instanceCredentials,
      groupId: lastMessage.chatId,
    },
    {
      skip:
        !lastMessage.chatId.includes('g.us') ||
        instanceCredentials.idInstance.toString().startsWith('7835'),
    }
  );

  const { data: contactInfo, isLoading: isContactInfoLoading } = useGetContactInfoQuery(
    {
      ...instanceCredentials,
      chatId: lastMessage.chatId,
    },
    {
      skip:
        lastMessage.chatId.includes('g.us') ||
        instanceCredentials.idInstance.toString().startsWith('7835'),
    }
  );

  const { data: avatarData } = useGetAvatarQuery(
    {
      ...instanceCredentials,
      chatId: lastMessage.chatId,
    },
    {
      skip: instanceCredentials.idInstance.toString().startsWith('7835'),
    }
  );

  const isLoading = isGroupDataLoading || isContactInfoLoading;

  const avatar = useMemo<string>(() => {
    if (contactInfo && contactInfo.avatar) {
      return contactInfo.avatar;
    }

    if (avatarData) {
      if (avatarData.urlAvatar) {
        return avatarData.urlAvatar;
      }

      if (!avatarData.available && !lastMessage.chatId.includes('g.us')) {
        return emptyAvatar;
      }
    }

    return lastMessage.chatId.includes('g.us') ? emptyAvatarGroup : emptyAvatarButAvailable;
  }, [contactInfo, avatarData, lastMessage]);

  if (groupData && groupData === 'Error: item-not-found') {
    return null;
  }

  const chatName =
    (groupData && groupData !== 'Error: forbidden' && groupData.subject) ||
    contactInfo?.contactName ||
    contactInfo?.name ||
    lastMessage.senderContactName ||
    lastMessage.senderName ||
    getPhoneNumberFromChatId(lastMessage.chatId);

  const textMessage = getTextMessage(lastMessage);

  const info = contactInfo || groupData;

  return (
    <List.Item
      className={`list-item contact-list__item ${activeChat && lastMessage.chatId === activeChat.chatId ? 'active' : ''}`}
      onClick={() =>
        setActiveChat({
          chatId: lastMessage.chatId,
          senderName: chatName,
          senderContactName: lastMessage.senderContactName,
          avatar: avatar,

          contactInfo: info,
        })
      }
      title={avatar === emptyAvatar ? t('BLOCKED_OR_PRIVATE_CHAT') : undefined}
    >
      <Skeleton avatar title={false} loading={isLoading} active>
        <List.Item.Meta
          avatar={<AvatarImage src={avatar} size="large" />}
          title={
            <h6
              className="text-overflow message-signerData"
              style={{ fontSize: 14, maxWidth: 280, width: '100%' }}
            >
              {chatName}
            </h6>
          }
          description={
            <Flex align="center" gap={5}>
              {lastMessage.statusMessage &&
                getOutgoingStatusMessageIcon(lastMessage.statusMessage, { width: 20, height: 20 })}
              {getMessageTypeIcon(lastMessage.typeMessage)}
              <span className="text-overflow" style={{ width: 300 }}>
                {textMessage}
              </span>
            </Flex>
          }
        />
        <span
          style={{
            textAlign: 'end',
            alignSelf: 'start',
          }}
        >
          {messageDate}
        </span>
      </Skeleton>
    </List.Item>
  );
};

export default ChatListItem;
