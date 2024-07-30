import { FC } from 'react';

import { Button, Space } from 'antd';

import { useActions, useAppSelector } from 'hooks';
import { selectActiveChat, selectShowContactList } from 'store/slices/chat.slice';

const ChatHeader: FC = () => {
  const showContactList = useAppSelector(selectShowContactList);
  const activeChat = useAppSelector(selectActiveChat);

  const { setShowContactList } = useActions();

  if (!showContactList) {
    return (
      <Space>
        <Button onClick={() => setShowContactList()}>Back</Button>
        <h3>{activeChat.senderName}</h3>
      </Space>
    );
  }

  return <h3>Chat</h3>;
};

export default ChatHeader;
