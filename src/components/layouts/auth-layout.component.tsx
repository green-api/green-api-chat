import { FC, useEffect } from 'react';

import { Layout } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';

import { Routes } from 'configs';
import { useAppSelector } from 'hooks';
import { selectMiniVersion } from 'store/slices/chat.slice';
import { selectAuth } from 'store/slices/user.slice';

const AuthLayout: FC = () => {
  const isMiniVersion = useAppSelector(selectMiniVersion);
  const isAuth = useAppSelector(selectAuth);

  const navigate = useNavigate();

  useEffect(() => {
    if (isAuth) {
      navigate(Routes.main);
    }
  }, [isAuth]);

  if (isMiniVersion) {
    return <></>;
  }

  return (
    <Layout className="app bg flex-center">
      <Outlet />
    </Layout>
  );
};

export default AuthLayout;
