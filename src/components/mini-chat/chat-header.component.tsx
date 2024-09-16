import { FC } from 'react';

import { LeftOutlined } from '@ant-design/icons';
import { Flex, Space, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import { useActions, useAppSelector } from 'hooks';
import { selectActiveChat } from 'store/slices/chat.slice';

const ChatHeader: FC = () => {
  const activeChat = useAppSelector(selectActiveChat);

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
        {activeChat.chatId.includes('@c') && <div>{activeChat.chatId.replace(/\@.*$/, '')}</div>}
      </Flex>
    );
  }

  return (
    <Flex justify="space-between" align="center">
      <h3 className="text-overflow">{t('CHAT_HEADER')}</h3>
      <Typography.Link href={''} target="_blank" rel="noreferrer">
        {t('FULL_VERSION')}
      </Typography.Link>
    </Flex>
  );
};

export default ChatHeader;
