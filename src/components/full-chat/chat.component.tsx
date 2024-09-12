import { FC } from 'react';

import { Flex } from 'antd';

import Aside from './aside/aside.component';
import ContentSide from './content-side.component';
import AuthForm from 'components/forms/auth-form.component';
import { useAppSelector } from 'hooks';
import { selectAuth } from 'store/slices/user.slice';

const Chat: FC = () => {
  const isAuth = useAppSelector(selectAuth);

  if (!isAuth) {
    return <AuthForm />;
  }

  return (
    <Flex className="full-chat" style={{ overflowY: 'hidden' }}>
      <Aside />
      <ContentSide />
    </Flex>
  );
};

export default Chat;
