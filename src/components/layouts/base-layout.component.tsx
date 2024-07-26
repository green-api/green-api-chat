import { FC } from 'react';

import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';

const BaseLayout: FC = () => {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

export default BaseLayout;
