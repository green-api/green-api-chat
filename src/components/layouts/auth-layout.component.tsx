import { FC, useEffect } from 'react';

import { Layout } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';

import { Routes } from 'configs';
import { useAppSelector } from 'hooks';
import { selectMiniVersion } from 'store/slices/chat.slice';
import { selectPlatform, selectUser } from 'store/slices/user.slice';
import { isAuth } from 'utils';

const AuthLayout: FC = () => {
  const isMiniVersion = useAppSelector(selectMiniVersion);
  const platform = useAppSelector(selectPlatform);
  const user = useAppSelector(selectUser);

  const navigate = useNavigate();

  useEffect(() => {
    if (isAuth(user)) {
      navigate(Routes.main);
    }
  }, [user, navigate]);

  if (isMiniVersion || platform !== 'web') {
    return <></>;
  }

  return (
    <Layout className="app bg flex-center">
      <Layout.Content className="auth-layout flex-center">
        <Outlet />
      </Layout.Content>
    </Layout>
  );
};

export default AuthLayout;
