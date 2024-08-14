import { FC } from 'react';

import { LeftOutlined } from '@ant-design/icons';
import { Space } from 'antd';
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
      <Space>
        <a className="back-button">
          <LeftOutlined onClick={() => setShowContactList()} />
        </a>
        <h3 className="text-overflow">{activeChat.senderName}</h3>
      </Space>
    );
  }

  return <h3 className="text-overflow">{t('CHAT_HEADER')}</h3>;
};

export default ChatHeader;
