import { FC } from 'react';

import { LeftOutlined } from '@ant-design/icons';
import { Flex, Space, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import { useActions, useAppSelector } from 'hooks';
import { selectActiveChat } from 'store/slices/chat.slice';
import { selectPlatform } from 'store/slices/user.slice';

const ChatHeader: FC = () => {
  const activeChat = useAppSelector(selectActiveChat);
  const platform = useAppSelector(selectPlatform);

  const { t } = useTranslation();

  const { setActiveChat } = useActions();

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
            onClick={() => {
              window.parent.postMessage({ event: 'openChats' }, '*');
            }}
            target="_parent"
            rel="noreferrer"
            title={t('FULL_VERSION_TITLE')}
          >
            {t('FULL_VERSION')}
          </Typography.Link>
        )}
        {/* {tariff === TariffsEnum.Developer && isChatWorking && (
          <Typography.Link title={t('TURN_OFF_CHAT')} onClick={() => setIsChatWorking(false)}>
            <PoweroffOutlined />
          </Typography.Link>
        )} */}
      </Space>
    </Flex>
  );
};

export default ChatHeader;
