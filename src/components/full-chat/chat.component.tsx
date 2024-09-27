import { FC } from 'react';

import { Flex } from 'antd';

import Aside from './aside/aside.component';
import ContentSide from './content-side.component';
import UserSide from './user-side/user-side.component';

const Chat: FC = () => {
  return (
    <Flex className="full-chat" style={{ overflowY: 'hidden' }}>
      <Aside />
      <UserSide />
      <ContentSide />
    </Flex>
  );
};

export default Chat;
