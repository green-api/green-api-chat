import { FC, useEffect, useRef, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { CALLS_APP_URL } from 'configs';
import { useAppSelector } from 'hooks';
import { selectType, selectUserSideActiveMode } from 'store/slices/chat.slice';
import {
  selectInstance,
  selectInstanceList,
  selectInstanceTariff,
  selectTypeInstance,
} from 'store/slices/instances.slice';
import { selectTheme } from 'store/slices/theme.slice';
import { selectPlatform, selectUser } from 'store/slices/user.slice';
import { MessageEventTypeEnum } from 'types';

const CallsPage: FC = () => {
  const {
    i18n: { resolvedLanguage },
  } = useTranslation();

  const type = useAppSelector(selectType);
  const currentTheme = useAppSelector(selectTheme);
  const { login, apiTokenUser, idUser, projectId } = useAppSelector(selectUser);
  const instanceData = useAppSelector(selectInstance);
  const instanceList = useAppSelector(selectInstanceList);
  const platform = useAppSelector(selectPlatform);
  const tariff = useAppSelector(selectInstanceTariff);
  const typeInstance = useAppSelector(selectTypeInstance);
  const activeMode = useAppSelector(selectUserSideActiveMode);

  const iframeReference = useRef<HTMLIFrameElement>(null);

  const [isIframeReady, setIsIframeReady] = useState(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === MessageEventTypeEnum.IFRAME_READY) {
        setIsIframeReady(true);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    if (isIframeReady && iframeReference.current?.contentWindow) {
      iframeReference.current.contentWindow.postMessage(
        {
          type: MessageEventTypeEnum.INIT,
          payload: {
            login: login,
            apiTokenUser: apiTokenUser,
            idUser: idUser,
            idInstance: instanceData.idInstance,
            apiTokenInstance: instanceData.apiTokenInstance,
            apiUrl: instanceData.apiUrl,
            mediaUrl: instanceData.mediaUrl,
            tariff: tariff,
            locale: resolvedLanguage,
            theme: currentTheme,
            platform: platform,
            typeInstance: typeInstance,
            projectId: projectId,
            instanceList: instanceList,
          },
        },
        CALLS_APP_URL
      );
    }
  }, [isIframeReady, instanceData]);

  useEffect(() => {
    if (resolvedLanguage && isIframeReady) {
      iframeReference.current?.contentWindow?.postMessage(
        {
          type: MessageEventTypeEnum.LOCALE_CHANGE,
          payload: {
            locale: resolvedLanguage,
          },
        },
        CALLS_APP_URL
      );
    }
  }, [resolvedLanguage, isIframeReady]);

  useEffect(() => {
    if (isIframeReady) {
      iframeReference.current?.contentWindow?.postMessage(
        {
          type: MessageEventTypeEnum.SET_THEME,
          payload: {
            theme: currentTheme,
          },
        },
        CALLS_APP_URL
      );
    }
  }, [currentTheme, isIframeReady]);

  return (
    <iframe
      src={CALLS_APP_URL + `?type=${type}`}
      frameBorder="0"
      className="w-100 h-100"
      style={{
        display: isIframeReady && activeMode === 'calls' ? 'initial' : 'none',
      }}
      name="calls"
      ref={iframeReference}
      allow="clipboard-read; clipboard-write"
    />
  );
};

export default CallsPage;
