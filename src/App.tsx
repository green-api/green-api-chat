import { useEffect } from 'react';

import { ConfigProvider } from 'antd';
import en_US from 'antd/es/locale/en_US';
import { useTranslation } from 'react-i18next';
import { RouterProvider } from 'react-router-dom';

import { DARK_THEME, DEFAULT_THEME, localisation } from 'configs';
import { useActions, useAppSelector } from 'hooks';
import router from 'router';
import { selectTheme } from 'store/slices/theme.slice';
import { MessageData, MessageEventTypeEnum, Themes } from 'types';
import { isConsoleMessageData, isPageInIframe } from 'utils';

function App() {
  const { i18n } = useTranslation();
  const { setSelectedInstance, setTheme, login, setPlatform } = useActions();

  const currentTheme = useAppSelector(selectTheme);
  const themesList = {
    [Themes.Default]: {
      className: 'default-theme',
      theme: DEFAULT_THEME,
    },
    [Themes.Dark]: {
      className: 'dark-theme',
      theme: DARK_THEME,
    },
  };

  // Add theme for html
  useEffect(() => {
    const html = document.documentElement;

    if (!isPageInIframe()) {
      html.classList.add('default-theme');

      return;
    }

    for (const key in themesList) {
      if (
        html.classList.contains(themesList[key as keyof typeof themesList].className) &&
        currentTheme !== key
      ) {
        html.classList.remove(themesList[key as keyof typeof themesList].className);

        continue;
      }

      if (currentTheme === key) {
        html.classList.add(themesList[key].className);
      }
    }
  }, [currentTheme]);

  useEffect(() => {
    function handleMessage(event: MessageEvent<MessageData>) {
      if (!isConsoleMessageData(event.data)) {
        console.log('unknown event');
        return;
      }

      switch (event.data.type) {
        case MessageEventTypeEnum.INIT:
          if (event.data.payload.instanceData) {
            setSelectedInstance(event.data.payload.instanceData);
          }

          login({
            ...event.data.payload.userData,
            remember: true,
          });

          setPlatform(event.data.payload.platform);

          setTheme(event.data.payload.theme);

          return i18n.changeLanguage(event.data.payload.locale);

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

  return (
    <ConfigProvider
      direction={i18n.dir()}
      locale={localisation[i18n.resolvedLanguage as keyof typeof localisation] || en_US}
      theme={themesList[currentTheme as keyof typeof themesList].theme}
    >
      <RouterProvider router={router} />
    </ConfigProvider>
  );
}

export default App;
