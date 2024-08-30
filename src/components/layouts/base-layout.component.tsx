import { FC } from 'react';

import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';

import { isPageInIframe } from 'utils';

const BaseLayout: FC = () => {
  return (
    <Layout className={`app ${!isPageInIframe() ? 'bg' : ''}`}>
      <Outlet />
    </Layout>
  );
};

export default BaseLayout;
