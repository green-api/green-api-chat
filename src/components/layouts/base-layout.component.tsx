import { FC } from 'react';

import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';

import { useAppSelector } from 'hooks';
import { selectMiniVersion } from 'store/slices/user.slice';

const BaseLayout: FC = () => {
  const isMiniVersion = useAppSelector(selectMiniVersion);

  return (
    <Layout className={`app ${!isMiniVersion ? 'bg' : ''}`}>
      <Outlet />
    </Layout>
  );
};

export default BaseLayout;
