import { StrictMode } from 'react';

import { setupListeners } from '@reduxjs/toolkit/query';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';

import App from './App';
import './i18n';
import { setupStore } from 'store';

import 'styles/index.scss';

const store = setupStore();
setupListeners(store.dispatch);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
);
