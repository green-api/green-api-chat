import { StrictMode } from 'react';

import { setupListeners } from '@reduxjs/toolkit/query';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';

import App from './App';
import './i18n';
import { setupStore } from 'store';

// eslint-disable-next-line import/no-unresolved,import/order
import { registerSW } from 'virtual:pwa-register';

import 'styles/index.scss';

registerSW({ immediate: true });

const store = setupStore();
setupListeners(store.dispatch);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
);
