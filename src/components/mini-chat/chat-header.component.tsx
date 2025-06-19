import { FC } from 'react';

import { LeftOutlined, PoweroffOutlined } from '@ant-design/icons';
import { Flex, Space, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import SelectStatusMode from 'components/UI/select/select-status.component';
import { CONSOLE_URL } from 'configs';
import { useActions, useAppSelector } from 'hooks';
import { selectActiveChat } from 'store/slices/chat.slice';
import { selectInstanceTariff, selectIsChatWorking } from 'store/slices/instances.slice';
import { selectPlatform } from 'store/slices/user.slice';
import { TariffsEnum } from 'types';

const ChatHeader: FC = () => {
  const activeChat = useAppSelector(selectActiveChat);
  const platform = useAppSelector(selectPlatform);
  const tariff = useAppSelector(selectInstanceTariff);
  const isChatWorking = useAppSelector(selectIsChatWorking);

  const { t } = useTranslation();

  const { setActiveChat, setIsChatWorking } = useActions();

  if (activeChat) {
    return (
      <Flex align="center" gap={10}>
        <Space className="chatHeader-space">
          <a className="back-button">
            <LeftOutlined onClick={() => setActiveChat(null)} />
          </a>
          <h3 className="text-overflow">{activeChat.senderName}</h3>
        </Space>
        {activeChat.chatId?.includes('@c') && <div>{activeChat.chatId?.replace(/\@.*$/, '')}</div>}
      </Flex>
    );
  }

  return (
    <Flex justify="space-between" align="center">
      <h3 className="text-overflow">{t('CHAT_HEADER')}</h3>
      <Space style={{ gap: 10 }}>
        {platform === 'web' && (
          <Typography.Link
            href={CONSOLE_URL + '/chats'}
            target="_parent"
            rel="noreferrer"
            title={t('FULL_VERSION_TITLE')}
          >
            {t('FULL_VERSION')}
          </Typography.Link>
        )}
        {tariff === TariffsEnum.Developer && isChatWorking && (
          <Typography.Link title={t('TURN_OFF_CHAT')} onClick={() => setIsChatWorking(false)}>
            <PoweroffOutlined />
            <SelectStatusMode />
          </Typography.Link>
        )}
      </Space>
    </Flex>
  );
};

export default ChatHeader;
