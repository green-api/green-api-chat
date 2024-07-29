import { StrictMode, Suspense } from 'react';

import { ConfigProvider, Spin } from 'antd';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';

import App from './App';
import './i18n';
import { THEME } from 'configs';
import { setupStore } from 'store';

import 'styles/index.scss';

const store = setupStore();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <Suspense
        fallback={
          <ConfigProvider theme={THEME}>
            <Spin style={{ margin: 'auto' }} size="large" />
          </ConfigProvider>
        }
      >
        <App />
      </Suspense>
    </Provider>
  </StrictMode>
);
