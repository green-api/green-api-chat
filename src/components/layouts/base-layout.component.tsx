import { FC, useEffect, useLayoutEffect } from 'react';

import { Layout } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';

import FullChat from 'components/full-chat/chat.component';
import MiniChat from 'components/mini-chat/chat.component';
import { Routes } from 'configs';
import { useActions, useAppSelector } from 'hooks';
import { selectMiniVersion } from 'store/slices/chat.slice';
import { selectUser } from 'store/slices/user.slice';
import { ChatType } from 'types';
import { isAuth } from 'utils';

const BaseLayout: FC = () => {
  const isMiniVersion = useAppSelector(selectMiniVersion);
  const user = useAppSelector(selectUser);

  const navigate = useNavigate();

  const [params] = useSearchParams();

  const { setType } = useActions();

  useLayoutEffect(() => {
    if (params.has('type')) {
      setType(params.get('type') as ChatType);
    }
  }, [params]);

  useEffect(() => {
    if (!isAuth(user) && !isMiniVersion) {
      navigate(Routes.auth);
    }
  }, [user, navigate, isMiniVersion]);

  return (
    <Layout className={`app ${!isMiniVersion ? 'bg' : ''}`}>
      <Layout.Content className={`main ${!isMiniVersion ? 'flex-center' : ''}`}>
        {isMiniVersion ? <MiniChat /> : <FullChat />}
      </Layout.Content>
    </Layout>
  );
};

export default BaseLayout;
