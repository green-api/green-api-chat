import { FC } from 'react';

import { Card } from 'antd';

import ChatHeader from './chat-header.component';
import ContactChat from './contact-chat/contact-chat.component';
import ContactList from './contact-list.component';
import { useAppSelector } from 'hooks';
import { selectShowContactList } from 'store/slices/chat.slice';

const Chat: FC = () => {
  const showContactList = useAppSelector(selectShowContactList);

  return (
    <Card title={<ChatHeader />} className="chat">
      {showContactList ? <ContactList /> : <ContactChat />}
    </Card>
  );
};

export default Chat;
