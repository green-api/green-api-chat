import { useEffect } from 'react';

import { ConfigProvider } from 'antd';
import en_US from 'antd/es/locale/en_US';
import he_IL from 'antd/es/locale/he_IL';
import ru_RU from 'antd/es/locale/ru_RU';
import { useTranslation } from 'react-i18next';
import { RouterProvider } from 'react-router-dom';

import { THEME } from 'configs';
import router from 'router';

function App() {
  const { i18n } = useTranslation();

  const localisation = {
    ru: ru_RU,
    en: en_US,
    he: he_IL,
  };

  useEffect(() => {
    document.documentElement.classList.add('default-theme');
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
