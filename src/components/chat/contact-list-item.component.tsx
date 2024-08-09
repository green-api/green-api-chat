import { FC, useMemo } from 'react';

import { LoadingOutlined } from '@ant-design/icons';
import { Flex, Spin } from 'antd';
import { useTranslation } from 'react-i18next';

import emptyAvatar from 'assets/emptyAvatar.png';
import emptyAvatarGroup from 'assets/emptyAvatarGroup.png';
import { useActions, useAppSelector } from 'hooks';
import {
  useGetAvatarQuery,
  useGetContactInfoQuery,
  useGetGroupDataQuery,
} from 'services/green-api/endpoints';
import { selectCredentials } from 'store/slices/user.slice';
import { LanguageLiteral, MessageInterface } from 'types';
import { getMessageDate } from 'utils';

interface ContactListItemProps {
  lastMessage: MessageInterface;
}

const ContactListItem: FC<ContactListItemProps> = ({ lastMessage }) => {
  const {
    i18n: { resolvedLanguage },
  } = useTranslation();

  const userCredentials = useAppSelector(selectCredentials);
  const { setActiveChat } = useActions();

  const messageDate = getMessageDate(
    lastMessage.timestamp * 1000,
    resolvedLanguage as LanguageLiteral
  );

  const { data: groupData, isLoading: isGroupDataLoading } = useGetGroupDataQuery(
    {
      idInstance: userCredentials.idInstance,
      apiTokenInstance: userCredentials.apiTokenInstance,
      groupId: lastMessage.chatId,
    },
    { skip: !lastMessage.chatId.includes('g.us') }
  );

  const { data: contactInfo, isLoading: isContactInfoLoading } = useGetContactInfoQuery(
    {
      idInstance: userCredentials.idInstance,
      apiTokenInstance: userCredentials.apiTokenInstance,
      chatId: lastMessage.chatId,
    },
    { skip: !!lastMessage.senderName || lastMessage.chatId.includes('g.us') }
  );

  const { data: avatarData } = useGetAvatarQuery({
    idInstance: userCredentials.idInstance,
    apiTokenInstance: userCredentials.apiTokenInstance,
    chatId: lastMessage.chatId,
  });

  const isLoading = isGroupDataLoading || isContactInfoLoading;

  const chatName =
    groupData?.subject ||
    contactInfo?.contactName ||
    contactInfo?.name ||
    lastMessage.senderContactName ||
    lastMessage.senderName ||
    lastMessage.chatId.slice(0, lastMessage.chatId.indexOf('@'));

  const avatar = useMemo<string>(() => {
    if (avatarData && avatarData.urlAvatar) {
      return avatarData.urlAvatar;
    }

    return lastMessage.chatId.includes('g.us') ? emptyAvatarGroup : emptyAvatar;
  }, [avatarData, lastMessage]);

  const textMessage =
    lastMessage.textMessage || lastMessage.extendedTextMessage?.text || lastMessage.typeMessage;

  return (
    <Flex
      className="contact-list__item"
      align="center"
      gap="small"
      onClick={() => setActiveChat({ ...lastMessage, senderName: chatName })}
    >
      <img className="avatar-image" src={avatar} alt="avatar" />
      <Flex className="contact-list__item-wrapper">
        <Flex vertical gap="small" className="contact-list__item-body">
          {isLoading ? (
            <Spin indicator={<LoadingOutlined />} size="small" style={{ alignSelf: 'start' }} />
          ) : (
            <h6 className="text-overflow">{chatName}</h6>
          )}
          <span className="text-overflow">{textMessage}</span>
        </Flex>
        <span
          style={{
            minWidth: messageDate.styleWidth ? messageDate.styleWidth : undefined,
            textAlign: 'end',
          }}
        >
          {messageDate.date}
        </span>
      </Flex>
    </Flex>
  );
};

export default ContactListItem;
