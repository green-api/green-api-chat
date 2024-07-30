import { FC, useEffect, useState } from 'react';

import { Flex } from 'antd';
import { useTranslation } from 'react-i18next';

import emptyAvatar from 'assets/emptyAvatar.png';
import { useActions, useAppSelector } from 'hooks';
import { useLazyGetGroupDataQuery } from 'services/green-api/endpoints';
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

  const [chatName, setChatName] = useState(
    lastMessage.chatId.slice(0, lastMessage.chatId.indexOf('@'))
  );
  const messageDate = getMessageDate(lastMessage.timestamp, resolvedLanguage as LanguageLiteral);

  const [getGroupData] = useLazyGetGroupDataQuery();

  useEffect(() => {
    async function getContactChatName(message: MessageInterface) {
      if (message.chatId.includes('g.us')) {
        const { data } = await getGroupData({
          idInstance: userCredentials.idInstance,
          apiTokenInstance: userCredentials.apiTokenInstance,
          groupId: message.chatId,
        });

        if (data) {
          setChatName(data.subject);
        }

        return;
      }

      setChatName(
        lastMessage.senderContactName ||
          lastMessage.senderName ||
          lastMessage.chatId.slice(0, lastMessage.chatId.indexOf('@'))
      );
    }

    getContactChatName(lastMessage);
  }, [getGroupData, userCredentials, lastMessage]);

  return (
    <Flex
      className="contact-list__item"
      align="center"
      gap="small"
      onClick={() => setActiveChat({ ...lastMessage, senderName: chatName })}
    >
      <img className="avatar-image" src={emptyAvatar} alt="avatar" />
      <Flex className="contact-list__item-wrapper">
        <Flex vertical gap="small" className="contact-list__item-body">
          <h6>{chatName}</h6>
          <span
            style={{
              display: '-webkit-box',
              overflow: 'hidden',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 1,
            }}
          >
            {lastMessage.textMessage ||
              lastMessage.extendedTextMessage?.text ||
              lastMessage.typeMessage}
          </span>
        </Flex>
        <span style={{ minWidth: messageDate.styleWidth ? messageDate.styleWidth : undefined }}>
          {messageDate.date}
        </span>
      </Flex>
    </Flex>
  );
};

export default ContactListItem;
