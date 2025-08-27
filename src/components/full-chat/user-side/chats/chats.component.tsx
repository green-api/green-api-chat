import { FC, useState } from 'react';

import { Button, Flex } from 'antd';
import { useTranslation } from 'react-i18next';

import AddNewChat from './add-new-chat.component';
import ChatsHeader from './chats-header.component';
import NewChatIcon from 'assets/newChat.svg?react';
import ChatList from 'components/shared/chat-list/chat-list.component';
import { useAppSelector } from 'hooks';
import { useIsMaxInstance } from 'hooks/use-is-max-instance';
import { useGetAccountSettingsQuery, useGetWaSettingsQuery } from 'services/green-api/endpoints';
import { selectMiniVersion, selectType } from 'store/slices/chat.slice';
import { selectInstance } from 'store/slices/instances.slice';
import { StateInstanceEnum } from 'types';

const Chats: FC = () => {
  const isMiniVersion = useAppSelector(selectMiniVersion);
  const type = useAppSelector(selectType);
  const instanceCredentials = useAppSelector(selectInstance);

  const isMax = useIsMaxInstance();

  const { data: waSettings, isLoading: isWaSettingsLoading } = useGetWaSettingsQuery(
    {
      ...instanceCredentials,
    },
    { skip: !instanceCredentials?.idInstance || !instanceCredentials?.apiTokenInstance || isMax }
  );

  const { data: accountSettings, isLoading: isAccountSettingsLoading } = useGetAccountSettingsQuery(
    {
      ...instanceCredentials,
    },
    { skip: !instanceCredentials?.idInstance || !instanceCredentials?.apiTokenInstance || !isMax }
  );

  const settings = isMax ? accountSettings : waSettings;

  const { t } = useTranslation();

  const [isVisible, setIsVisible] = useState(false);

  return (
    <Flex className="chats" vertical>
      {!isMiniVersion && type === 'tab' && <ChatsHeader />}

      <Flex
        align="center"
        gap={8}
        style={{ padding: '6px 20px' }}
        justify={type === 'partner-iframe' ? 'end' : 'space-between'}
      >
        <Flex gap={20} align="center">
          <p style={{ fontSize: '1.5rem' }}>{t('CHAT_HEADER')}</p>
          {(!isWaSettingsLoading || !isAccountSettingsLoading) && (
            <div
              style={{
                padding: '4px 10px',
                borderRadius: 4,
                color:
                  settings?.stateInstance === StateInstanceEnum.Authorized
                    ? 'var(--authorized-text-color)'
                    : 'var(--not-authorized-text-color)',
                backgroundColor:
                  settings?.stateInstance === StateInstanceEnum.Authorized
                    ? 'var(--authorized-status-color)'
                    : 'var(--not-authorized-status-color)',
              }}
            >
              {settings?.stateInstance === StateInstanceEnum.Authorized
                ? t('AUTHORIZED')
                : t('NOT_AUTHORIZED')}
            </div>
          )}
          {settings?.stateInstance === StateInstanceEnum.NotAuthorized && (
            <Button variant="outlined">{t('AUTHORIZE')}</Button>
          )}
        </Flex>
        {!isMiniVersion && (type === 'console-page' || type === 'partner-iframe') && (
          <a className={type === 'partner-iframe' ? 'p-10' : undefined}>
            <NewChatIcon
              style={{ fontSize: 20 }}
              onClick={() => setIsVisible(true)}
              title={t('ADD_NEW_CHAT_HEADER')}
            />
          </a>
        )}
      </Flex>

      <ChatList key={instanceCredentials?.idInstance} />
      {!isMiniVersion && (type === 'console-page' || type === 'partner-iframe') && (
        <AddNewChat isVisible={isVisible} setIsVisible={setIsVisible} />
      )}
    </Flex>
  );
};

export default Chats;
