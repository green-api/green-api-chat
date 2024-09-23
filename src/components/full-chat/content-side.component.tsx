import { FC } from 'react';

import { Flex } from 'antd';

import ContactChat from './contact-chat/contact-chat.component';
import HomeView from './home-view.component';
import { useAppSelector } from 'hooks';
import { selectActiveChat } from 'store/slices/chat.slice';

const ContentSide: FC = () => {
  const activeChat = useAppSelector(selectActiveChat);

  if (activeChat) {
    return (
      <Flex className="content-side">
        <ContactChat />
      </Flex>
    );
  }

  return (
    <Flex className="content-side">
      <HomeView />
    </Flex>
  );
};

export default ContentSide;
