import { FC } from 'react';

import { CloseOutlined } from '@ant-design/icons';
import { Space } from 'antd';
import { Header } from 'antd/es/layout/layout';

import waChatIcon from 'assets/wa-chat.svg';
import AvatarImage from 'components/UI/avatar-image.component';
import { useActions, useAppSelector } from 'hooks';
import { selectActiveChat, selectType } from 'store/slices/chat.slice';
import { ActiveChat } from 'types';
import { isWhatsAppOfficialChat } from 'utils';

const ContactChatHeader: FC = () => {
  const activeChat = useAppSelector(selectActiveChat) as ActiveChat;
  const type = useAppSelector(selectType);
  
  const { setActiveChat, setContactInfoOpen } = useActions();

  const isOfficial = isWhatsAppOfficialChat(activeChat.chatId);

  return (
    <Header className="contact-chat-header">
      <Space className="chatHeader-space" onClick={() => setContactInfoOpen(true)}>
        <AvatarImage src={isOfficial ? waChatIcon : activeChat.avatar} size="large" />
        <h3 className="text-overflow">{isOfficial ? 'WhatsApp' : activeChat.senderName}</h3>
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
