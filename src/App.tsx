import { useEffect } from 'react';

import { ConfigProvider } from 'antd';
import en_US from 'antd/es/locale/en_US';
import { useTranslation } from 'react-i18next';
import { RouterProvider } from 'react-router-dom';

import { localisation, THEME } from 'configs';
import router from 'router';

function App() {
  const { i18n } = useTranslation();

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
