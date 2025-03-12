import { FC, useEffect, useLayoutEffect } from 'react';

import { Layout } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';

import FullChat from 'components/full-chat/chat.component';
import MiniChat from 'components/mini-chat/chat.component';
import { Routes } from 'configs';
import { useActions, useAppSelector } from 'hooks';
import { selectMiniVersion } from 'store/slices/chat.slice';
import { selectUser } from 'store/slices/user.slice';
import { TariffsEnum } from 'types';
import { isAuth, isPartnerChat, isValidChatType } from 'utils';

const BaseLayout: FC = () => {
  const isMiniVersion = useAppSelector(selectMiniVersion);
  const user = useAppSelector(selectUser);

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const { setType, setSelectedInstance } = useActions();

  useLayoutEffect(() => {
    if (searchParams.has('type')) {
      const chatType = searchParams.get('type');

      if (chatType && isValidChatType(chatType)) {
        setType(chatType);
      }
    }

    if (isPartnerChat(searchParams)) {
      const idInstance = searchParams.get('idInstance');
      const apiTokenInstance = searchParams.get('apiTokenInstance');
      const apiUrl = searchParams.get('apiUrl');
      const mediaUrl = searchParams.get('mediaUrl');

      if (idInstance && apiTokenInstance && apiUrl && mediaUrl) {
        setType('partner-iframe');
        setSelectedInstance({
          idInstance: +idInstance,
          apiTokenInstance: apiTokenInstance,
          apiUrl: apiUrl + '/',
          mediaUrl: mediaUrl + '/',
          tariff: TariffsEnum.Business,
        });
      }
    }
  }, [searchParams]);

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
