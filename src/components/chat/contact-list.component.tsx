import { FC } from 'react';

import { Empty, Flex, Row, Spin } from 'antd';

import ContactListItem from './contact-list-item.component';
import { useAppSelector } from 'hooks';
import {
  useLastIncomingMessagesQuery,
  useLastOutgoingMessagesQuery,
} from 'services/green-api/endpoints';
import { selectCredentials } from 'store/slices/user.slice';
import { getErrorMessage, getLastFiveChats } from 'utils';

const ContactList: FC = () => {
  const userCredentials = useAppSelector(selectCredentials);

  const {
    data: lastIncomingMessages = [],
    isLoading: isLastIncomingLoading,
    error: lastIncomingError,
  } = useLastIncomingMessagesQuery(
    {
      idInstance: userCredentials.idInstance,
      apiTokenInstance: userCredentials.apiTokenInstance,
      minutes: 3000,
    },
    { skipPollingIfUnfocused: true, pollingInterval: 15000 }
  );

  const {
    data: lastOutgoingMessages = [],
    isLoading: isLastOutgoingLoading,
    error: lastOutgoingError,
  } = useLastOutgoingMessagesQuery(
    {
      idInstance: userCredentials.idInstance,
      apiTokenInstance: userCredentials.apiTokenInstance,
      minutes: 3000,
    },
    { skipPollingIfUnfocused: true, pollingInterval: 15000 }
  );

  if (isLastIncomingLoading || isLastOutgoingLoading) {
    return (
      <Row justify="center" align="middle" className="min-height-460">
        <Spin size="large" />
      </Row>
    );
  }

  if (lastIncomingError || lastOutgoingError) {
    return (
      <Empty
        className="empty p-10 min-height-460"
        description={getErrorMessage(lastIncomingError || lastOutgoingError)}
      />
    );
  }

  const lastFiveChats = getLastFiveChats(lastIncomingMessages, lastOutgoingMessages);

  if (!lastFiveChats.length) {
    return (
      <Empty
        className="empty p-10 min-height-460"
        description="За последнее время у вас нет чатов"
      />
    );
  }

  return (
    <Flex vertical className="contact-list min-height-460">
      {lastFiveChats.map((message) => (
        <ContactListItem key={message.chatId} lastMessage={message} />
      ))}
    </Flex>
  );
};

export default ContactList;
