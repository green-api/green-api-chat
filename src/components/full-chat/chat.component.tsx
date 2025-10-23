import { FC } from 'react';

import { Flex } from 'antd';

import Aside from './aside/aside.component';
import ContentSide from './content-side/content-side.component';
import UserSide from './user-side/user-side.component';
import { useAppSelector } from 'hooks';
import { selectType } from 'store/slices/chat.slice';

const Chat: FC = () => {
  const type = useAppSelector(selectType);

  return (
    <Flex
      className={`full-chat ${type === 'console-page' ? 'console-page' : ''}`}
      style={{ overflowY: 'hidden' }}
    >
      <Aside />
      <UserSide />
      <ContentSide />
    </Flex>
  );
};

export default Chat;
