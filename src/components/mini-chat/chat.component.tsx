import { FC } from 'react';

import { Card } from 'antd';

import ChatFooter from './chat-footer.component';
import ChatHeader from './chat-header.component';
import ContactChat from './contact-chat/contact-chat.component';
import ContactList from './contact-list.component';
import { useAppSelector } from 'hooks';
import { selectShowContactList } from 'store/slices/chat.slice';

const Chat: FC = () => {
  const showContactList = useAppSelector(selectShowContactList);

  if (!showContactList) {
    return (
      <Card title={<ChatHeader />} className="chat">
        <ContactChat />
      </Card>
    );
  }

  return (
    <Card title={<ChatHeader />} className="chat">
      <ContactList />
      <ChatFooter />
    </Card>
  );
};

export default Chat;
