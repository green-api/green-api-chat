import { MessageInterface } from './api.types';

export * from './api.types';

export interface UserState {
  credentials: UserCredentials;
  isAuth: boolean;
}
export interface UserCredentials {
  idInstance: string;
  apiTokenInstance: string;
}

export interface ChatState {
  activeChat: ActiveChat | null;
  isMiniVersion: boolean;
}

export interface ActiveChat extends MessageInterface {
  avatar: string;
}

export interface InstanceInterface {
  idInstance: string;
  apiTokenInstance: string;
}

export interface ApiErrorResponse<T = unknown> {
  status: number | string;
  data: T;
}

export interface GreenApiUrlsInterface {
  api: string;
  media: string;
  qrHost: string;
  qrHttpHost: string;
}

export interface GreenApiRouteInterface extends GreenApiUrlsInterface {
  // string - для одного значения, string[] - для диапазона значений
  instancesCodes: (number | [number, number])[];
}

export type LanguageLiteral = 'en' | 'ru' | 'he';

export interface ChatFormValues {
  message: string;
}

export interface NewChatFormValues extends ChatFormValues {
  chatId: string;
}

export type MessageData = MessageDataInit | MessageDataSetCredentials | MessageDataLocaleChange;

export enum MessageEventTypeEnum {
  INIT = 'init',
  LOCALE_CHANGE = 'localeChange',
  SET_CREDENTIALS = 'setCredentials',
}

export interface MessageDataInit {
  type: MessageEventTypeEnum.INIT;
  payload: UserCredentials &
    LocaleChangeMessage & {
      isMiniVersion: boolean;
    };
}

export interface MessageDataLocaleChange {
  type: MessageEventTypeEnum.LOCALE_CHANGE;
  payload: LocaleChangeMessage;
}

export interface MessageDataSetCredentials {
  type: MessageEventTypeEnum.SET_CREDENTIALS;
  payload: UserCredentials;
}

interface LocaleChangeMessage {
  locale: LanguageLiteral;
}
