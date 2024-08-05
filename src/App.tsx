import { useEffect } from 'react';

import { ConfigProvider } from 'antd';
import en_US from 'antd/es/locale/en_US';
import { useTranslation } from 'react-i18next';
import { RouterProvider } from 'react-router-dom';

import { isConsoleMessageData } from './utils';
import { localisation, THEME } from 'configs';
import { useActions } from 'hooks';
import router from 'router';
import { MessageData, MessageEventTypeEnum } from 'types';

function App() {
  const { i18n } = useTranslation();
  const { setCredentials } = useActions();

  useEffect(() => {
    document.documentElement.classList.add('default-theme');
  }, []);

  useEffect(() => {
    function handleMessage(event: MessageEvent<MessageData>) {
      console.log(event);

      if (!isConsoleMessageData(event.data)) {
        console.log('unknown event');
        return;
      }

      switch (event.data.type) {
        case MessageEventTypeEnum.INIT:
          setCredentials({
            idInstance: event.data.payload.idInstance,
            apiTokenInstance: event.data.payload.apiTokenInstance,
          });

          return i18n.changeLanguage(event.data.payload.locale);

        case MessageEventTypeEnum.SET_CREDENTIALS:
          return setCredentials(event.data.payload);

        case MessageEventTypeEnum.LOCALE_CHANGE:
          return i18n.changeLanguage(event.data.payload.locale);

        default:
          return;
      }
    }

    window.addEventListener('message', handleMessage);

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <ConfigProvider
      direction={i18n.dir()}
      locale={localisation[i18n.resolvedLanguage as keyof typeof localisation] || en_US}
      theme={THEME}
    >
      <RouterProvider router={router} />
    </ConfigProvider>
  );
}

export default App;
