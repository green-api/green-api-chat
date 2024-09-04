import { FC } from 'react';

import { Layout } from 'antd';

import FullChat from 'components/full-chat/chat.component';
import MiniChat from 'components/mini-chat/chat.component';
import { useAppSelector } from 'hooks';
import { selectMiniVersion } from 'store/slices/chat.slice';

const Main: FC = () => {
  const isMiniVersion = useAppSelector(selectMiniVersion);

  return (
    <Layout.Content className="main flex-center">
      {isMiniVersion ? <MiniChat /> : <FullChat />}
    </Layout.Content>
  );
};

export default Main;
