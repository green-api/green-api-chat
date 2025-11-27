export enum Routes {
  baseUrl = '/chat',
  main = '/',
  auth = '/auth',
}

export enum GreenApiRoutes {
  registration = 'https://console.green-api.com/registration',
  recoverPassword = 'https://console.green-api.com/auth/restore',
}

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
  freeDeveloperAccountTutorial: {
    default: 'https://www.youtube.com/embed/FW--xWr-9Nw?start=36',
    en: 'https://www.youtube.com/embed/FW--xWr-9Nw?start=36',
    ru: 'https://www.youtube.com/embed/e-91GrRDBVc?start=27',
    rutube: 'https://rutube.ru/play/embed/64d23df2ce90aff6e808106cfb430228/?t=27&r=plwd',
  },
  billingEmail: {
    default: 'billing@green-api.com',
  },
  website_ru: 'https://green-api.com/',
  website_en: 'https://green-api.com/en/',
  website_he: 'https://green-api.org.il/',
  userAgreement: {
    ru: 'https://green-api.com/user-agreement',
    he: 'https://green-api.org.il/user-agreement',
    default: 'https://greenapi.com/user-agreement',
  },
  privacyPolicy: {
    ru: 'https://green-api.com/privacy-policy',
    he: 'https://green-api.org.il/privacy-policy',
    default: 'https://greenapi.com/privacy-policy',
  },
};

export const CONSOLE_URL = document.referrer;
