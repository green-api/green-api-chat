import { FC, useState } from 'react';

import { Button, Flex, Spin } from 'antd';
import { useTranslation } from 'react-i18next';

import AddNewChat from './add-new-chat.component';
import ChatsHeader from './chats-header.component';
import NewChatIcon from 'assets/newChat.svg?react';
import AuthorizationStatus from 'components/instance-auth/authorization-status.component';
import ChatList from 'components/shared/chat-list/chat-list.component';
import SelectStatusMode from 'components/UI/select/select-status.component';
import { useActions, useAppSelector } from 'hooks';
import { useInstanceSettings } from 'hooks/use-instance-settings.hook';
import { useIsMaxInstance } from 'hooks/use-is-max-instance';
import { selectMiniVersion, selectType } from 'store/slices/chat.slice';
import { selectInstance } from 'store/slices/instances.slice';
import { StateInstanceEnum } from 'types';

const Chats: FC = () => {
  const isMiniVersion = useAppSelector(selectMiniVersion);
  const type = useAppSelector(selectType);
  const instanceCredentials = useAppSelector(selectInstance);
  const { setIsAuthorizingInstance } = useActions();

  const { t } = useTranslation();

  const { settings } = useInstanceSettings();

  const [isVisible, setIsVisible] = useState(false);

  const isMax = useIsMaxInstance();

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
          <AuthorizationStatus />
          {settings?.stateInstance === StateInstanceEnum.NotAuthorized && (
            <Button variant="outlined" onClick={() => setIsAuthorizingInstance(true)}>
              {t('AUTHORIZE')}
            </Button>
          )}
        </Flex>
        <Flex gap={14} align="center">
          {!isMax && <SelectStatusMode />}
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
      </Flex>
      {(settings?.stateInstance === StateInstanceEnum.Authorized ||
        settings?.stateInstance === StateInstanceEnum.Suspended) && (
        <ChatList key={instanceCredentials?.idInstance} />
      )}
      {!isMiniVersion && (type === 'console-page' || type === 'partner-iframe') && (
        <AddNewChat isVisible={isVisible} setIsVisible={setIsVisible} />
      )}
    </Flex>
  );
};

export default Chats;
