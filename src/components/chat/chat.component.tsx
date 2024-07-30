import { FC } from 'react';

import { Card, Spin } from 'antd';

import ChatHeader from './chat-header.component';
import ContactChat from './contact-chat.component';
import ContactList from './contact-list.component';
import { useAppSelector } from 'hooks';
import {
  useLastIncomingMessagesQuery,
  useLastOutgoingMessagesQuery,
} from 'services/green-api/endpoints';
import { selectShowContactList } from 'store/slices/chat.slice';
import { selectCredentials } from 'store/slices/user.slice';
import { getLastFiveChats } from 'utils';

const Chat: FC = () => {
  const userCredentials = useAppSelector(selectCredentials);
  const showContactList = useAppSelector(selectShowContactList);

  const {
    data: lastIncomingMessages,
    isLoading: isLastIncomingLoading,
    error: lastIncomingError,
  } = useLastIncomingMessagesQuery({
    idInstance: userCredentials.idInstance,
    apiTokenInstance: userCredentials.apiTokenInstance,
    minutes: 4320,
  });

  const {
    data: lastOutgoingMessages,
    isLoading: isLastOutgoingLoading,
    error: lastOutgoingError,
  } = useLastOutgoingMessagesQuery({
    idInstance: userCredentials.idInstance,
    apiTokenInstance: userCredentials.apiTokenInstance,
    minutes: 4320,
  });

  if (
    isLastIncomingLoading ||
    isLastOutgoingLoading ||
    !lastIncomingMessages ||
    !lastOutgoingMessages
  ) {
    return (
      <Card title={<h3>Chat</h3>} extra="testExtra" className="chat">
        <div className="spin-wrapper">
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  const lastFiveChats = getLastFiveChats(lastIncomingMessages, lastOutgoingMessages);

  return (
    <Card title={<ChatHeader />} extra={showContactList ? 'extraTest' : null} className="chat">
      {showContactList ? <ContactList list={lastFiveChats} /> : <ContactChat />}
    </Card>
  );
};

export default Chat;
