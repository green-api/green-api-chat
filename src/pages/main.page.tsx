import { FC } from 'react';

import { Layout } from 'antd';

import Chat from 'components/chat/chat.component';

const Main: FC = () => {
  return (
    <Layout.Content className="main">
      <Chat />
    </Layout.Content>
  );
};

export default Main;
