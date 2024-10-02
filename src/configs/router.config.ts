export enum Routes {
  baseUrl = '/chat',
  main = '/',
  auth = '/auth',
}

export enum GreenApiRoutes {
  registration = 'https://console.green-api.com/registration',
  recoverPassword = 'https://console.green-api.com/auth/restore',
}

export const consoleUrl = 'https://console.green-api.com/';

export const EXTERNAL_LINKS = {
  telegram: {
    ru: 'https://t.me/green_api',
    default: 'https://t.me/GreenAPI_bot',
  },
  youtube: {
    ru: 'https://youtube.com/channel/UC3GSFwFUFwEG1tyJEwq420Q',
    en: 'https://youtube.com/channel/UCaSiSG2NGdhNzyCTaUNTqFA',
    he: '',
    default: 'https://youtube.com/channel/UCaSiSG2NGdhNzyCTaUNTqFA',
  },
  github: 'https://github.com/green-api/issues/issues',
  whatsapp: 'https://wa.me/972506973848',
  whatsappNewsChannel: {
    default: 'https://whatsapp.com/channel/0029VaLj6J4LNSa2B5Jx6s3h',
    ru: 'https://whatsapp.com/channel/0029VaHUM5TBA1f7cG29nO1C',
  },
  supportEmail: {
    default: 'support@green-api.com',
    'console.greenapi.com': 'support@greenapi.com',
  },
  billingEmail: {
    default: 'billing@green-api.com',
  },
  website_ru: 'https://green-api.com/',
  website_en: 'https://green-api.com/en/',
  website_he: 'https://green-api.org.il/',
};

export const CHAT_APP_URL = import.meta.env.VITE_CHAT_APP_HOST ?? window.origin + '/chat/';
