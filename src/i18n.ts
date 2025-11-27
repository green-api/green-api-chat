import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    backend: {
      loadPath: '/locales_0.0.68/{{lng}}/translation.json',
      expirationTime: 24 * 60 * 60 * 1000,
    },
    detection: {
      order: ['localStorage', 'navigator', 'querystring', 'cookie', 'htmlTag', 'path', 'subdomain'],
      lookupQuerystring: 'lng',
      lookupCookie: 'i18next',
      lookupLocalStorage: 'i18nextLng',
      lookupFromPathIndex: 0,
      caches: ['localStorage', 'cookie'],
      lookupFromSubdomainIndex: 0,
      excludeCacheFor: ['cimode'],
      cookieMinutes: 10,
      cookieDomain: 'myDomain',
      htmlTag: document.documentElement,
    },
    interpolation: {
      escapeValue: false,
    },
  });

export { default } from 'i18next';
