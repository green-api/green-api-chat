import { StrictMode } from 'react';

import { createRoot } from 'react-dom/client';

import './i18n';
import App from './App.tsx';

import 'styles/index.scss';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
