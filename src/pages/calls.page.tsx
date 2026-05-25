import { FC, useEffect, useRef } from 'react';

import { useTranslation } from 'react-i18next';

import { CALLS_APP_URL } from 'configs';
import { useActions, useAppSelector } from 'hooks';
import {
  selectIsCallsIframeReady,
  selectType,
  selectUserSideActiveMode,
} from 'store/slices/chat.slice';
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
  const isCallsIframeReady = useAppSelector(selectIsCallsIframeReady);

  const iframeReference = useRef<HTMLIFrameElement>(null);

  const { setIsCallsIframeReady } = useActions();

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (
        event.data?.type === MessageEventTypeEnum.IFRAME_READY &&
        event.origin !== window.origin
      ) {
        setIsCallsIframeReady(true);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    if (isCallsIframeReady && iframeReference.current?.contentWindow) {
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
  }, [isCallsIframeReady, instanceData]);

  useEffect(() => {
    if (resolvedLanguage && isCallsIframeReady) {
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
  }, [resolvedLanguage, isCallsIframeReady]);

  useEffect(() => {
    if (isCallsIframeReady) {
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
  }, [currentTheme, isCallsIframeReady]);

  return (
    <iframe
      src={CALLS_APP_URL + `?type=${type}`}
      frameBorder="0"
      className="w-100 h-100"
      style={{
        display: isCallsIframeReady && activeMode === 'calls' ? 'initial' : 'none',
      }}
      name="calls"
      ref={iframeReference}
      allow="clipboard-read; clipboard-write"
    />
  );
};

export default CallsPage;
