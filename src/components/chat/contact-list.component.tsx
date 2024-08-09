import { FC } from 'react';

import { Empty, Flex, Row, Spin } from 'antd';
import { useTranslation } from 'react-i18next';

import ContactListItem from './contact-list-item.component';
import { useAppSelector } from 'hooks';
import { useLastMessagesQuery } from 'services/green-api/endpoints';
import { selectCredentials } from 'store/slices/user.slice';
import { getErrorMessage } from 'utils';

const ContactList: FC = () => {
  const userCredentials = useAppSelector(selectCredentials);

  const { t } = useTranslation();

  const { data, isLoading, error } = useLastMessagesQuery(
    {
      idInstance: userCredentials.idInstance,
      apiTokenInstance: userCredentials.apiTokenInstance,
    },
    { skipPollingIfUnfocused: true, pollingInterval: 15000 }
  );

  if (isLoading) {
    return (
      <Row justify="center" align="middle" className="min-height-460">
        <Spin size="large" />
      </Row>
    );
  }

  if (error) {
    return <Empty className="empty p-10 min-height-460" description={getErrorMessage(error, t)} />;
  }

  if (!data?.length) {
    return <Empty className="empty p-10 min-height-460" description={t('EMPTY_CHAT_LIST')} />;
  }

  return (
    <Flex vertical className="contact-list min-height-460">
      {data?.map((message) => <ContactListItem key={message.chatId} lastMessage={message} />)}
    </Flex>
  );
};

export default ContactList;
