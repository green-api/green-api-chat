import { FC } from 'react';

import { Flex } from 'antd';

import Aside from './aside/aside.component';
import ContentSide from './content-side.component';

const Chat: FC = () => {
  return (
    <Flex className="full-chat" style={{ overflowY: 'hidden' }}>
      <Aside />
      <ContentSide />
    </Flex>
  );
};

export default Chat;
