import { FC, useEffect } from 'react';

import { Layout } from 'antd';
import { useNavigate } from 'react-router-dom';

import FulChat from 'components/full-chat/chat.component';
import MiniChat from 'components/mini-chat/chat.component';
import { Routes } from 'configs';
import { useAppSelector } from 'hooks';
import { selectMiniVersion } from 'store/slices/chat.slice';
import { selectUser } from 'store/slices/user.slice';
import { isAuth } from 'utils';

const BaseLayout: FC = () => {
  const isMiniVersion = useAppSelector(selectMiniVersion);
  const user = useAppSelector(selectUser);

  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuth(user) && !isMiniVersion) {
      navigate(Routes.auth);
    }
  }, [user, navigate, isMiniVersion]);

  return (
    <Layout className={`app ${!isMiniVersion ? 'bg' : ''}`}>
      <Layout.Content className={`main ${!isMiniVersion ? 'flex-center' : ''}`}>
        {isMiniVersion ? <MiniChat /> : <FulChat />}
      </Layout.Content>
    </Layout>
  );
};

export default BaseLayout;
