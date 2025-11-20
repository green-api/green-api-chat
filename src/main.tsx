import { StrictMode, Suspense } from 'react';

import { setupListeners } from '@reduxjs/toolkit/query';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';

import App from './App';
import './i18n';
import ErrorBoundary from 'components/error-boundary.component';
import { setupStore } from 'store';

import 'styles/index.scss';
import { Spin } from 'antd';

const store = setupStore();
setupListeners(store.dispatch);

const persistor = persistStore(store);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <Suspense fallback={<Spin />}>
        <PersistGate loading={null} persistor={persistor}>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </PersistGate>
      </Suspense>
    </Provider>
  </StrictMode>
);
