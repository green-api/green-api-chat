import { FC } from 'react';

import { Card } from 'antd';

import ChatFooter from './chat-footer.component';
import ChatHeader from './chat-header.component';
import ContactChat from './contact-chat/contact-chat.component';
import ChatList from 'components/shared/chat-list.component';
import { useAppSelector } from 'hooks';
import { selectActiveChat } from 'store/slices/chat.slice';

const Chat: FC = () => {
  const activeChat = useAppSelector(selectActiveChat);

  if (activeChat) {
    return (
      <Card title={<ChatHeader />} className="chat">
        <ContactChat />
      </Card>
    );
  }

  return (
    <Card title={<ChatHeader />} className="chat">
      <ChatList />
      <ChatFooter />
    </Card>
  );
};

export default Chat;
