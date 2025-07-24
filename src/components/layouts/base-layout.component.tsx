import { FC, useEffect, useLayoutEffect, useState } from 'react';

import { Layout } from 'antd';
import i18n from 'i18next';
import { useSearchParams } from 'react-router-dom';

import FullChat from 'components/full-chat/chat.component';
import MiniChat from 'components/mini-chat/chat.component';
import { useActions, useAppSelector } from 'hooks';
import { selectMiniVersion, selectType } from 'store/slices/chat.slice';
import { selectUser } from 'store/slices/user.slice';
import { MessageData, MessageEventTypeEnum, TariffsEnum } from 'types';
import {
  isAuth,
  isPartnerChat,
  isValidChatType,
  isConsoleMessageData,
  getIsChatWorkingFromStorage,
  isPageInIframe,
} from 'utils';

const BaseLayout: FC = () => {
  const isMiniVersion = useAppSelector(selectMiniVersion);
  const type = useAppSelector(selectType);
  const user = useAppSelector(selectUser);

  const [isEventAdded, setIsEventAdded] = useState(false);

  const [searchParams] = useSearchParams();

  const { setType, setSelectedInstance, setBrandData, setTheme, login, setPlatform } = useActions();

  useEffect(() => {
    function handleMessage(event: MessageEvent<MessageData>) {
      if (!isConsoleMessageData(event.data)) {
        return;
      }

      switch (event.data.type) {
        case MessageEventTypeEnum.INIT:
          if (event.data.payload) {
            let isChatWorking: boolean | null = null;

            if (
              event.data.payload &&
              event.data.payload?.idInstance &&
              event.data.payload.tariff === TariffsEnum.Developer
            ) {
              isChatWorking = getIsChatWorkingFromStorage(event.data.payload?.idInstance);
            }

            setSelectedInstance({
              idInstance: event.data.payload.idInstance,
              apiTokenInstance: event.data.payload.apiTokenInstance,
              apiUrl: event.data.payload.apiUrl,
              mediaUrl: event.data.payload.mediaUrl,
              tariff: event.data.payload.tariff,
              isChatWorking: isChatWorking,
            });
            setIsEventAdded(true);
            login({
              login: event.data.payload.login,
              idUser: event.data.payload.idUser,
              apiTokenUser: event.data.payload.apiTokenUser,
              remember: true,
              projectId: event.data.payload.projectId,
            });

            setPlatform(event.data.payload.platform);

            setTheme(event.data.payload.theme);

            return i18n.changeLanguage(event.data.payload.locale);
          }

          return;

        case MessageEventTypeEnum.SET_CREDENTIALS:
          return setSelectedInstance(event.data.payload);

        case MessageEventTypeEnum.LOCALE_CHANGE:
          return i18n.changeLanguage(event.data.payload.locale);

        case MessageEventTypeEnum.SET_THEME:
          return setTheme(event.data.payload.theme);

        default:
          return;
      }
    }

    window.addEventListener('message', handleMessage);

    return () => window.removeEventListener('message', handleMessage);
  }, []);

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

      const language = searchParams.get('lng');

      const brandDescription = searchParams.get('dsc');
      const brandImageUrl = searchParams.get('logo');

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

      language && i18n.changeLanguage(language);

      brandDescription && setBrandData({ description: brandDescription });
      brandImageUrl && setBrandData({ brandImageUrl });
    }
  }, [searchParams]);

  useEffect(() => {
    const isNotAuthorized = !isAuth(user);
    const isNotPartner = !isPartnerChat(searchParams);
    const isNotIframe = !isPageInIframe();

    const shouldThrowOnMini = isNotAuthorized && !isMiniVersion && isNotPartner && isEventAdded;
    const shouldThrowOnTab = isNotAuthorized && isNotPartner && isNotIframe && type === 'tab';

    if (shouldThrowOnMini || shouldThrowOnTab) {
      throw new Error('NO_INSTANCE_CREDENTIALS');
    }
  }, [user, isMiniVersion, searchParams, isEventAdded, type]);

  return (
    <Layout className={`app ${!isMiniVersion ? 'bg' : ''}`}>
      <Layout.Content className={`main ${!isMiniVersion ? 'flex-center' : ''}`}>
        {isMiniVersion ? <MiniChat /> : <FullChat />}
      </Layout.Content>
    </Layout>
  );
};

export default BaseLayout;
