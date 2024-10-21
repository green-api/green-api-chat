import { Dispatch, ReactElement, SetStateAction } from 'react';

import { FormItemProps } from 'antd';

import {
  ExpandedInstanceInterface,
  GetContactInfoResponseInterface,
  GetGroupDataResponseInterface,
  MessageInterface,
  UserInterface,
} from './api.types';

export * from './api.types';
export * from './waba.types';

export interface UserState {
  user: UserInterface;
  platform: ChatPlatform;
}

export interface InstanceCredentials {
  idInstance: number;
  apiTokenInstance: string;
}

export interface ChatState {
  activeChat: ActiveChat | null;
  userSideActiveMode: UserSideActiveMode;
  activeSendingMode: SendingMethodName | null;
  isMiniVersion: boolean;
  type: ChatType;
  messageCount: number;
  isContactInfoOpen: boolean;
}

export type ChatType = 'tab' | 'console-page' | 'instance-view-page';
export type ChatPlatform = 'web' | 'ios' | 'android';

export interface ActiveChat
  extends Pick<MessageInterface, 'chatId' | 'senderName' | 'senderContactName'> {
  avatar: string;
  contactInfo?: GetContactInfoResponseInterface | GetGroupDataResponseInterface;
}

export interface InstancesState {
  selectedInstance: InstanceCredentials;
}

export interface InstanceInterface {
  idInstance: number;
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

export interface AuthFormValues {
  login: string;
  password: string;
  remember: boolean;
}

export interface ChatFormValues {
  message: string;
  response: string;
  quotedMessageId?: string;
}

export interface NewChatFormValues extends ChatFormValues {
  chatId: string;
}

export interface SendFileFormValues extends ChatFormValues {
  file: File;
  fileName?: string;
  caption?: string;
}

export interface SendContactFormValues extends ChatFormValues {
  phoneContact: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  company?: string;
}

export interface SendLocationFormValues extends ChatFormValues {
  latitude: string;
  longitude: string;
  nameLocation?: string;
  address?: string;
}

export interface SendPollFormValues extends ChatFormValues {
  options: { optionName: string }[];
  multipleAnswers?: boolean;
}

export interface FormRequestItemInterface extends Omit<FormItemProps, 'name'> {
  key: string;
  name?: string | string[];
  isCustomElement?: boolean;
  showRequired?: boolean;
}

export type MessageData =
  | MessageDataInit
  | MessageDataSetCredentials
  | MessageDataLocaleChange
  | MessageDataSetTheme;

export enum MessageEventTypeEnum {
  INIT = 'init',
  LOCALE_CHANGE = 'localeChange',
  SET_CREDENTIALS = 'setCredentials',
  SET_THEME = 'setTheme',
}

export interface MessageDataInit {
  type: MessageEventTypeEnum.INIT;
  payload: InstanceCredentials &
    LocaleChangeMessage &
    ThemeChangeMessage &
    UserInterface & { platform: ChatPlatform };
}

export interface MessageDataLocaleChange {
  type: MessageEventTypeEnum.LOCALE_CHANGE;
  payload: LocaleChangeMessage;
}

export interface MessageDataSetTheme {
  type: MessageEventTypeEnum.SET_THEME;
  payload: ThemeChangeMessage;
}

export interface MessageDataSetCredentials {
  type: MessageEventTypeEnum.SET_CREDENTIALS;
  payload: InstanceCredentials;
}

interface LocaleChangeMessage {
  locale: LanguageLiteral;
}

interface ThemeChangeMessage {
  theme: Themes;
}

export type SendingMethodName = 'sendFileByUpload' | 'sendContact' | 'sendLocation' | 'sendPoll';

export type UserSideActiveMode = 'chats' | 'settings' | 'profile';

export interface SendingMethod {
  name: SendingMethodName;
  element: ReactElement;
}

export interface GlobalModalPropertiesInterface {
  isVisible: boolean;
  setIsVisible: Dispatch<SetStateAction<boolean>>;
}

export const enum Themes {
  Default = 'default',
  Dark = 'dark',
}

export interface CookieOptionsInterface {
  'max-age'?: number;
  secure?: boolean;
  path?: string;
  domain?: string;
}

export interface AsideItem {
  item: UserSideActiveMode;
  title: string;
  icon: ReactElement;
}

export interface UserSideItem {
  item: UserSideActiveMode;
  element: ReactElement;
}

export interface SelectInstanceItemInterface extends ExpandedInstanceInterface {
  label: JSX.Element | string;
}

export type HasDefaultInstance = 'unknown' | 'yes' | 'no';
