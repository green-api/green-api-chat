import { FC } from 'react';

import { Flex } from 'antd';
import { Outlet } from 'react-router-dom';

import { useAppSelector, useMediaQuery } from 'hooks';
import { selectActiveChat } from 'store/slices/chat.slice';

const ContentSide: FC = () => {
  const activeChat = useAppSelector(selectActiveChat);
  const matchMedia = useMediaQuery('(max-width: 975px)');

  return (
    <Flex
      className={`content-side relative ${matchMedia && !activeChat ? 'display-none' : ''} chat-border`}
    >
      <Outlet />
    </Flex>
  );
};

export default ContentSide;
