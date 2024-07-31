import { FC } from 'react';

import { Flex, Spin } from 'antd';

import ContactListItem from './contact-list-item.component';
import { useAppSelector } from 'hooks';
import {
  useLastIncomingMessagesQuery,
  useLastOutgoingMessagesQuery,
} from 'services/green-api/endpoints';
import { selectCredentials } from 'store/slices/user.slice';
import { getLastFiveChats } from 'utils';

const ContactList: FC = () => {
  const userCredentials = useAppSelector(selectCredentials);

  const {
    data: lastIncomingMessages = [],
    isLoading: isLastIncomingLoading,
    error: lastIncomingError,
  } = useLastIncomingMessagesQuery({
    idInstance: userCredentials.idInstance,
    apiTokenInstance: userCredentials.apiTokenInstance,
    minutes: 4320,
  });

  const {
    data: lastOutgoingMessages = [],
    isLoading: isLastOutgoingLoading,
    error: lastOutgoingError,
  } = useLastOutgoingMessagesQuery({
    idInstance: userCredentials.idInstance,
    apiTokenInstance: userCredentials.apiTokenInstance,
    minutes: 4320,
  });

  if (isLastIncomingLoading || isLastOutgoingLoading) {
    return (
      <div className="flex-center spin-wrapper">
        <Spin size="large" />
      </div>
    );
  }

  const lastFiveChats = getLastFiveChats(lastIncomingMessages, lastOutgoingMessages);

  return (
    <Flex vertical className="contact-list">
      {lastFiveChats.map((message) => (
        <ContactListItem key={message.chatId} lastMessage={message} />
      ))}
    </Flex>
  );
};

export default ContactList;
