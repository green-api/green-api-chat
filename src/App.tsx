import { useEffect } from 'react';

import { ConfigProvider } from 'antd';
import en_US from 'antd/es/locale/en_US';
import { useTranslation } from 'react-i18next';
import { RouterProvider } from 'react-router-dom';

import { useGetProfileSettingsQuery } from './services/app/endpoints';
import { DARK_THEME, DEFAULT_THEME, localisation } from 'configs';
import { useAppSelector } from 'hooks';
import router from 'router';
import { selectTheme } from 'store/slices/theme.slice';
import { selectUser } from 'store/slices/user.slice';
import { Themes } from 'types';
import { isPageInIframe } from 'utils';

function App() {
  const { idUser, apiTokenUser, projectId } = useAppSelector(selectUser);

  const { i18n } = useTranslation();

  useGetProfileSettingsQuery(
    { idUser, apiTokenUser, projectId },
    { skip: !idUser || !apiTokenUser }
  );

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
