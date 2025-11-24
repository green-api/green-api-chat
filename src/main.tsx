import { StrictMode, Suspense } from 'react';
import { setupListeners } from '@reduxjs/toolkit/query';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';

import App from './App';
import './i18n';
import ErrorBoundary from 'components/error-boundary.component';
import LizardLoader from 'components/UI/lizard-loader.component';
import { setupStore } from 'store';

import 'styles/index.scss';

const store = setupStore();
setupListeners(store.dispatch);

const EXPIRE_MS = 3 * 60 * 1000;
const raw = localStorage.getItem('persist:root');

if (raw) {
  try {
    const parsed = JSON.parse(raw);
    const timestamp = Number(parsed?.timestamp);

    if (!timestamp || Number.isNaN(timestamp) || Date.now() - timestamp > EXPIRE_MS) {
      localStorage.removeItem('persist:root');
    }
  } catch (err) {
    console.error('Error checking persist timestamp', err);
  }
}

export const persistor = persistStore(store);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <Suspense fallback={<LizardLoader />}>
        <PersistGate loading={null} persistor={persistor}>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </PersistGate>
      </Suspense>
    </Provider>
  </StrictMode>
);
