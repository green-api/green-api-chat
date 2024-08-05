import { FC } from 'react';

import { ArrowLeftOutlined } from '@ant-design/icons';
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
        <a>
          <ArrowLeftOutlined onClick={() => setShowContactList()} />
        </a>
        <h3>{activeChat.senderName}</h3>
      </Space>
    );
  }

  return <h3>{t('CHAT_HEADER')}</h3>;
};

export default ChatHeader;
