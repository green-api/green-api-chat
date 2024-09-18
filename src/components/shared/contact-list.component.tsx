import { FC } from 'react';

import { Empty, Flex, List, Spin } from 'antd';
import { useTranslation } from 'react-i18next';

import ContactListItem from './contact-list-item.component';
import { useAppSelector } from 'hooks';
import { useLastMessagesQuery } from 'services/green-api/endpoints';
import { selectMiniVersion } from 'store/slices/chat.slice';
import { selectCredentials } from 'store/slices/user.slice';
import { getErrorMessage } from 'utils';

const ContactList: FC = () => {
  const userCredentials = useAppSelector(selectCredentials);
  const isMiniVersion = useAppSelector(selectMiniVersion);

  const { t } = useTranslation();

  const { data, isLoading, error } = useLastMessagesQuery(
    {
      idInstance: userCredentials.idInstance,
      apiTokenInstance: userCredentials.apiTokenInstance,
    },
    { skipPollingIfUnfocused: true, pollingInterval: 15000 }
  );

  if (error) {
    if ('status' in error && error.status === 429) {
      return (
        <Flex
          className={`contact-list ${isMiniVersion ? 'min-height-460' : 'min-height-720'}`}
          align="center"
          justify="center"
        >
          <Spin size="large" />
        </Flex>
      );
    }

    return (
      <Empty
        className={`empty p-10 ${isMiniVersion ? 'min-height-460' : 'height-720'}`}
        description={getErrorMessage(error, t)}
      />
    );
  }

  return (
    <List
      itemLayout="horizontal"
      className={`contact-list ${isMiniVersion ? 'min-height-460' : 'height-720'}`}
      dataSource={data}
      renderItem={(message) => <ContactListItem key={message.chatId} lastMessage={message} />}
      loading={{
        spinning: isLoading,
        className: `${isMiniVersion ? 'min-height-460' : 'min-height-720'}`,
        size: 'large',
      }}
      locale={{
        emptyText: <Empty className="empty p-10" description={t('EMPTY_CHAT_LIST')} />,
      }}
    />
  );
};

export default ContactList;
