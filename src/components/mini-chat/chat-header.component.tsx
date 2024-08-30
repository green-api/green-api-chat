import { FC } from 'react';

import { LeftOutlined } from '@ant-design/icons';
import { Flex, Space } from 'antd';
import { useTranslation } from 'react-i18next';

import { useActions, useAppSelector } from 'hooks';
import { selectActiveChat, selectShowContactList } from 'store/slices/chat.slice';

const ChatHeader: FC = () => {
  const showContactList = useAppSelector(selectShowContactList);
  const activeChat = useAppSelector(selectActiveChat);

  const { t } = useTranslation();

  const { setShowContactList } = useActions();

  if (!showContactList) {
    return (
      <Flex align="center" gap={10}>
        <Space className="chatHeader-space">
          <a className="back-button">
            <LeftOutlined onClick={() => setShowContactList()} />
          </a>
          <h3 className="text-overflow">{activeChat.senderName}</h3>
        </Space>
        {activeChat.chatId.includes('@c') && <div>{activeChat.chatId.replace(/\@.*$/, '')}</div>}
      </Flex>
    );
  }

  return <h3 className="text-overflow">{t('CHAT_HEADER')}</h3>;
};

export default ChatHeader;
