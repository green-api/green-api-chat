import { FC } from 'react';

import { Flex } from 'antd';

import Aside from './aside/aside.component';
import ContentSide from './content-side/content-side.component';
import UserSide from './user-side/user-side.component';
import { CALLS_APP_URL } from 'configs';
import { useAppSelector } from 'hooks';
import CallsPage from 'pages/calls.page';
import { selectType, selectUserSideActiveMode } from 'store/slices/chat.slice';
import { selectTypeInstance } from 'store/slices/instances.slice';

const Chat: FC = () => {
  const type = useAppSelector(selectType);
  const typeInstance = useAppSelector(selectTypeInstance);
  const activeMode = useAppSelector(selectUserSideActiveMode);
  const isCallsNeedToRender =
    type !== 'one-chat-only' &&
    type !== 'instance-view-page' &&
    typeInstance === 'whatsapp' &&
    CALLS_APP_URL !== '__VITE_CALLS_APP_URL__';

  return (
    <Flex
      className={`full-chat ${type === 'console-page' ? 'console-page' : ''}`}
      style={{ overflowY: 'hidden' }}
    >
      <Aside />
      {isCallsNeedToRender && <CallsPage />}
      {activeMode !== 'calls' && (
        <>
          <UserSide />
          <ContentSide />
        </>
      )}
    </Flex>
  );
};

export default Chat;
