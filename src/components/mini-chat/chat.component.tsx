import { FC } from 'react';

import { Card } from 'antd';

import ChatFooter from './chat-footer.component';
import ChatHeader from './chat-header.component';
import ContactChat from './contact-chat/contact-chat.component';
import DeveloperInstanceAlert from 'components/alerts/developer-instance-alert.component';
import ChatList from 'components/shared/chat-list/chat-list.component';
import { useAppSelector } from 'hooks';
import { selectActiveChat } from 'store/slices/chat.slice';
import { selectInstanceTariff, selectIsChatWorking } from 'store/slices/instances.slice';
import { TariffsEnum } from 'types';

const Chat: FC = () => {
  const instanceTariff = useAppSelector(selectInstanceTariff);
  const isChatWorking = useAppSelector(selectIsChatWorking);
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
      {instanceTariff === TariffsEnum.Developer && !isChatWorking ? (
        <DeveloperInstanceAlert />
      ) : (
        <ChatList />
      )}
      <ChatFooter />
    </Card>
  );
};

export default Chat;
