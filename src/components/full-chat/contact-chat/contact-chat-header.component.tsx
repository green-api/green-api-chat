import { FC } from 'react';

import { CloseOutlined } from '@ant-design/icons';
import { Space } from 'antd';
import { Header } from 'antd/es/layout/layout';

import AvatarImage from 'components/shared/avatar-image.component';
import { useActions, useAppSelector } from 'hooks';
import { selectActiveChat } from 'store/slices/chat.slice';
import { ActiveChat } from 'types';

const ContactChatHeader: FC = () => {
  const activeChat = useAppSelector(selectActiveChat) as ActiveChat;

  const { setActiveChat } = useActions();

  return (
    <Header className="contact-chat-header">
      <Space className="chatHeader-space">
        <AvatarImage src={activeChat.avatar} />
        <h3 className="text-overflow">{activeChat.senderName}</h3>
      </Space>

      <Space>
        {activeChat.chatId.includes('@c') && <span>{activeChat.chatId.replace(/\@.*$/, '')}</span>}
        <CloseOutlined style={{ width: 13 }} onClick={() => setActiveChat(null)} />
      </Space>
    </Header>
  );
};

export default ContactChatHeader;
