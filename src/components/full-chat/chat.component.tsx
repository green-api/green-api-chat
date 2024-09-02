import { FC } from 'react';

import { Flex } from 'antd';

import Aside from './aside/aside.component';
import HomeView from './home-view.component';
import ContactChat from '../mini-chat/contact-chat/contact-chat.component';
import { useAppSelector } from 'hooks';
import { selectActiveChat } from 'store/slices/chat.slice';

const Chat: FC = () => {
  const activeChat = useAppSelector(selectActiveChat);

  if (activeChat) {
    return (
      <Flex className="full-chat">
        <Aside />
        <ContactChat />
      </Flex>
    );
  }

  return (
    <Flex className="full-chat">
      <Aside />
      <HomeView />
    </Flex>
  );
};

export default Chat;
