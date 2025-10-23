import { i18n } from 'i18next';

import { getUTCDate } from './date.utils';
import { isApiError } from './type-guard.utils';
import { EXTERNAL_LINKS, Routes } from 'configs';
import {
  ChatType,
  CookieOptionsInterface,
  ExpandedInstanceInterface,
  LanguageLiteral,
  UserInterface,
} from 'types';

export * from './component.utils';
export * from './date.utils';
export * from './chat-list.utils';
export * from './type-guard.utils';
export * from './message.utils';

export function getErrorMessage(error: unknown, t: i18n['t']): string | null {
  let errorMessage = '';
  if (!error || !isApiError(error)) {
    return t('UNKNOWN_ERROR');
  }

  switch (error.status) {
    case 466:
      errorMessage = t('METHOD_QUOTA_EXCEEDED_ERROR');
      break;

    case 429:
      errorMessage = t('TOO_MANY_REQUESTS_ERROR');
      break;

    case 400:
      errorMessage = error.data.message;
      break;

    case 'FETCH_ERROR':
      errorMessage = t('FETCH_ERROR');
      break;

    default:
      errorMessage = t('UNKNOWN_ERROR');
  }

  return errorMessage;
}

export function isPageInIframe() {
  return window.location !== window.parent.location;
}

export function getIsMiniVersion(type: ChatType) {
  return isPageInIframe() && type === 'instance-view-page';
}

export function getFormData<Object_ extends object>(data: Object_): FormData {
  const formData = new FormData();

  for (const [key, value] of Object.entries(data)) {
    if (!value) continue;

    formData.set(key, value);
  }

  return formData;
}

export function isSafari() {
  return (
    window.navigator.userAgent.includes('Safari') && !window.navigator.userAgent.includes('Chrome')
  );
}

export function getCookie(name: string): string | undefined {
  const matches = document.cookie.match(
    new RegExp('(?:^|; )' + name.replaceAll(/([$()*+./?[\\\]^{|}])/g, '\\$1') + '=([^;]*)')
  );

  return matches ? decodeURIComponent(matches[1]) : undefined;
}

export function setCookie(name: string, value: string, options: CookieOptionsInterface = {}): void {
  options.path = options.path ?? Routes.main;
  options['max-age'] = options['max-age'] ?? 31_536_000;

  let updatedCookie = encodeURIComponent(name) + '=' + encodeURIComponent(value);

  for (const optionKey in options) {
    updatedCookie += '; ' + optionKey;

    const optionValue = options[optionKey as keyof CookieOptionsInterface];

    if (optionValue !== true) updatedCookie += '=' + optionValue;
  }

  document.cookie = updatedCookie;
}

export function deleteCookie(name: string): void {
  setCookie(name, '', {
    'max-age': -1,
  });
}

export function isAuth(user: UserInterface) {
  return !!(user.idUser && user.apiTokenUser && user.login);
}

export function isNewInstance(timeCreated: ExpandedInstanceInterface['timeCreated']) {
  return (getUTCDate(new Date()).getTime() - new Date(timeCreated).getTime()) / 1000 < 121;
}

export function getIsChatWorkingFromStorage(idInstance: number): boolean | null {
  let isChatWorking: boolean | null = null;

  try {
    const isChatWorkingFromStorage = localStorage.getItem(idInstance.toString());

    isChatWorking = JSON.parse(isChatWorkingFromStorage!);
  } catch {}

  return isChatWorking;
}

export function setIsChatWorkingFromStorage(idInstance: number, isChatWorking: boolean): void {
  localStorage.setItem(idInstance.toString(), JSON.stringify(isChatWorking));
}

export function isPartnerChat(searchParams: URLSearchParams): boolean {
  return (
    searchParams.has('idInstance') &&
    searchParams.has('apiTokenInstance') &&
    searchParams.has('apiUrl') &&
    searchParams.has('mediaUrl')
  );
}

export function getSupportEmailByLanguage(language: LanguageLiteral) {
  if (language === 'en' || language === 'he')
    return EXTERNAL_LINKS.supportEmail['console.greenapi.com'];

  return EXTERNAL_LINKS.supportEmail.default;
}
