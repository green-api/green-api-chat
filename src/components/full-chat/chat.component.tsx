import { FC } from 'react';

import { Flex } from 'antd';

import Aside from './aside/aside.component';
import ContentSide from './content-side.component';
import UserSide from './user-side/user-side.component';
import { useAppSelector } from 'hooks';
import { selectMiniVersion, selectType } from 'store/slices/chat.slice';

const Chat: FC = () => {
  const isMiniVersion = useAppSelector(selectMiniVersion);
  const type = useAppSelector(selectType);

  return (
    <Flex
      className={`full-chat ${type === 'console-page' ? 'console-page' : ''}`}
      style={{ overflowY: 'hidden' }}
    >
      {!isMiniVersion && type === 'tab' && <Aside />}
      <UserSide />
      <ContentSide />
    </Flex>
  );
};

export default Chat;
