import { FC, useState } from 'react';

import { PlusOutlined } from '@ant-design/icons';
import { Button, Flex } from 'antd';
import { useTranslation } from 'react-i18next';

import AddNewChat from './add-new-chat.component';
import NewChatIcon from 'assets/newChat.svg?react';
import AuthorizationStatus from 'components/instance-auth/authorization-status.component';
import ChatList from 'components/shared/chat-list/chat-list.component';
import { useActions, useAppSelector } from 'hooks';
import { useInstanceSettings } from 'hooks/use-instance-settings.hook';
import { selectMiniVersion, selectType } from 'store/slices/chat.slice';
import {
  selectInstance,
  selectIsLastMessagesSyncingAfterAuthorization,
} from 'store/slices/instances.slice';
import { StateInstanceEnum } from 'types';
import { isAuthorizedInstanceState } from 'utils';

const Chats: FC = () => {
  const isMiniVersion = useAppSelector(selectMiniVersion);
  const type = useAppSelector(selectType);
  const instanceCredentials = useAppSelector(selectInstance);
  const isLastMessagesSyncingAfterAuthorization = useAppSelector(
    selectIsLastMessagesSyncingAfterAuthorization
  );
  const { setIsAuthorizingInstance } = useActions();

  const { t } = useTranslation();

  const { settings } = useInstanceSettings();

  const [isVisible, setIsVisible] = useState(false);

  const needToRenderNewChatBtn =
    !isMiniVersion &&
    isAuthorizedInstanceState(settings?.stateInstance) &&
    type !== 'instance-view-page' &&
    type !== 'one-chat-only';

  return (
    <Flex className="chats" vertical>
      <Flex
        align="center"
        gap={8}
        style={{ padding: '6px 20px' }}
        justify={type === 'mobile-mode' ? 'end' : 'space-between'}
      >
        {type !== 'mobile-mode' && (
          <Flex gap={20} align="center">
            <p style={{ fontSize: '1.5rem' }}>{t('CHAT_HEADER')}</p>
            <AuthorizationStatus />
            {settings?.stateInstance === StateInstanceEnum.NotAuthorized &&
              !isLastMessagesSyncingAfterAuthorization && (
                <Button variant="outlined" onClick={() => setIsAuthorizingInstance(true)}>
                  {t('AUTHORIZE')}
                </Button>
              )}
          </Flex>
        )}
        <Flex gap={14} align="center">
          {needToRenderNewChatBtn &&
            (type === 'mobile-mode' ? (
              <Button
                className="p-10"
                onClick={() => setIsVisible(true)}
                title={t('ADD_NEW_CHAT_HEADER')}
                shape="circle"
                type="primary"
                icon={<PlusOutlined className="new-chat-btn" />}
              />
            ) : (
              <a className={type === 'partner-iframe' ? 'p-10' : undefined}>
                <NewChatIcon onClick={() => setIsVisible(true)} title={t('ADD_NEW_CHAT_HEADER')} />
              </a>
            ))}
        </Flex>
      </Flex>
      {(isAuthorizedInstanceState(settings?.stateInstance) ||
        settings?.stateInstance === StateInstanceEnum.Suspended ||
        isLastMessagesSyncingAfterAuthorization) && (
        <ChatList key={instanceCredentials?.idInstance} />
      )}
      {!isMiniVersion && type !== 'instance-view-page' && type !== 'one-chat-only' && (
        <AddNewChat isVisible={isVisible} setIsVisible={setIsVisible} />
      )}
    </Flex>
  );
};

export default Chats;
