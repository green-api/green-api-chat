import { FC, useEffect } from 'react';

import { Layout } from 'antd';
import { useNavigate } from 'react-router-dom';

import FulChat from 'components/full-chat/chat.component';
import MiniChat from 'components/mini-chat/chat.component';
import { Routes } from 'configs';
import { useAppSelector } from 'hooks';
import { selectMiniVersion } from 'store/slices/chat.slice';
import { selectAuth } from 'store/slices/user.slice';

const BaseLayout: FC = () => {
  const isMiniVersion = useAppSelector(selectMiniVersion);
  const isAuth = useAppSelector(selectAuth);

  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuth) {
      navigate(Routes.auth);
    }
  }, [isAuth]);

  return (
    <Layout className={`app ${!isMiniVersion ? 'bg' : ''}`}>
      <Layout.Content className={`main ${!isMiniVersion ? 'flex-center' : ''}`}>
        {isMiniVersion ? <MiniChat /> : <FulChat />}
      </Layout.Content>
    </Layout>
  );
};

export default BaseLayout;
