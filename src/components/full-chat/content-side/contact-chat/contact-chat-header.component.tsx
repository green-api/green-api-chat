import { FC } from 'react';

import { CloseOutlined } from '@ant-design/icons';
import { Space } from 'antd';
import { Header } from 'antd/es/layout/layout';

import AvatarImage from 'components/UI/avatar-image.component';
import { useActions, useAppSelector } from 'hooks';
import { selectActiveChat } from 'store/slices/chat.slice';
import { ActiveChat } from 'types';

const ContactChatHeader: FC = () => {
  const activeChat = useAppSelector(selectActiveChat) as ActiveChat;

  const { setActiveChat, setContactInfoOpen } = useActions();

  return (
    <Header className="contact-chat-header">
      <Space className="chatHeader-space" onClick={() => setContactInfoOpen(true)}>
        <AvatarImage src={activeChat.avatar} size="large" />
        <h3 className="text-overflow">{activeChat.senderName}</h3>
      </Space>

      <Space>
        {activeChat.chatId?.includes('@c') && (
          <span>{activeChat.chatId?.replace(/\@.*$/, '')}</span>
        )}
        <a>
          <CloseOutlined style={{ width: 13 }} onClick={() => setActiveChat(null)} />
        </a>
      </Space>
    </Header>
  );
};

export default ContactChatHeader;
