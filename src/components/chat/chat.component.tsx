import { FC, useEffect } from 'react';

import { Card } from 'antd';
import { useSearchParams } from 'react-router-dom';

import ChatFooter from './chat-footer.component';
import ChatHeader from './chat-header.component';
import ContactChat from './contact-chat/contact-chat.component';
import ContactList from './contact-list.component';
import { useActions, useAppSelector } from 'hooks';
import { selectShowContactList } from 'store/slices/chat.slice';

const Chat: FC = () => {
  const showContactList = useAppSelector(selectShowContactList);
  const { setCredentials } = useActions();

  const [searchParams] = useSearchParams();
  const idInstance = searchParams.get('idInstance');
  const apiTokenInstance = searchParams.get('apiTokenInstance');

  useEffect(() => {
    if (idInstance && apiTokenInstance) {
      setCredentials({
        idInstance,
        apiTokenInstance,
      });
    }
  }, [idInstance, apiTokenInstance, setCredentials]);

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
