import { Dispatch, HTMLAttributes, ReactElement, SetStateAction } from 'react';

import { FormItemProps, ProgressProps } from 'antd';
import { Color } from 'antd/es/color-picker';

import {
  Button,
  ExpandedInstanceInterface,
  FontType,
  GetContactInfoResponseInterface,
  GetGroupDataSuccessResponseInterface,
  MessageInterface,
  QuotedMessageInterface,
  StatusMessage,
  TariffsEnum,
  TypeConnectionMessage,
  TypeMessage,
  UserInterface,
} from './api.types';
import {
  ParsedWabaTemplateInterface,
  TemplateButtonInterface,
  WabaTemplateInterface,
  WabaTemplateTypeEnum,
} from './waba.types';

export * from './api.types';
export * from './waba.types';

export interface UserState {
  user: UserInterface;
  platform: ChatPlatform;
}

export interface ChatState {
  activeChat: ActiveChat | null;
  userSideActiveMode: UserSideActiveMode;
  activeSendingMode: SendingMethodName | null;
  isMiniVersion: boolean;
  type: ChatType;
  messageCount: number;
  isContactInfoOpen: boolean;
  activeTemplate: WabaTemplateInterface | null;
  templateMessagesLoading: boolean;
  searchQuery: string;
  description?: string;
  brandImgUrl?: string;
  replyMessage: MessageDataForRender | null;
}

export type ChatType =
  | 'tab'
  | 'console-page'
  | 'instance-view-page'
  | 'partner-iframe'
  | 'one-chat-only';
export type ChatPlatform = 'web' | 'ios' | 'android';

export interface ActiveChat
  extends Pick<MessageInterface, 'chatId' | 'senderName' | 'senderContactName'> {
  avatar: string;
  contactInfo?:
    | GetContactInfoResponseInterface
    | GetGroupDataSuccessResponseInterface
    | 'Error: forbidden'
    | 'groupId not found';
}

export interface InstancesState {
  selectedInstance: InstanceInterface;
  tariff: TariffsEnum;
  isChatWorking: boolean | null;
  typeInstance: TypeInstance;
  instanceList: ExpandedInstanceInterface[] | null;
  isAuthorizingInstance: boolean;
}

export type TypeInstance = 'whatsapp' | 'v3';

export interface InstanceInterface {
  idInstance: number;
  apiTokenInstance: string;
  apiUrl: string;
  mediaUrl: string;
}

export interface ApiErrorResponse<T = DefaultApiErrorResponseData> {
  status: number | string;
  data: T;
}

export interface DefaultApiErrorResponseData {
  message: string;
  path: string;
  statusCode: number;
  timestamp: string;
}

export interface MessageMenuState {
  activeMode: 'messageInfo' | 'menu';
  activeServiceMethod: MessageServiceMethodName | null;
  messageDataForRender: MessageDataForRender | null;
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
  typePreview?: 'small' | 'large';
  linkPreview?: boolean;
  isCustomPreview?: boolean;
  customPreview?: {
    title: string;
    description: string;
    link?: string;
    urlFile?: string;
    jpegThumbnail?: string;
  };
}

export interface ButtonsFormValues {
  body: string;
  header: string;
  footer: string;
  buttons: Button[];
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

export interface SendTextStatusFormValues extends ChatFormValues {
  message: string;
  backgroundColor?: Color;
  font: FontType;
  participants?: string[];
}

export interface SendVoiceStatusFormValues extends ChatFormValues {
  urlFile: string;
  backgroundColor?: Color;
  fileName: FontType;
  participants?: string[];
}

export interface SendTemplateValues extends ChatFormValues {
  params?: { param: string }[];
  templateId: string;
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
  payload: InstanceInterface &
    LocaleChangeMessage &
    ThemeChangeMessage &
    UserInterface & {
      platform: ChatPlatform;
      tariff: TariffsEnum;
      typeInstance: TypeInstance;
      instanceList: ExpandedInstanceInterface[];
    };
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
  payload: InstanceInterface & {
    platform: ChatPlatform;
    tariff: TariffsEnum;
    typeInstance: TypeInstance;
  };
}

interface LocaleChangeMessage {
  locale: LanguageLiteral;
}

interface ThemeChangeMessage {
  theme: Themes;
}

export type SendingMethodName =
  | 'sendFileByUpload'
  | 'sendContact'
  | 'sendLocation'
  | 'sendPoll'
  | 'sendTemplate'
  | 'sendPreview'
  | 'sendButtons'
  | 'sendTextStatus'
  | 'sendVoiceStatus'
  | 'sendMediaStatus';

export type MessageServiceMethodName = 'editMessage' | 'deleteMessage';

export type UserSideActiveMode =
  | 'chats'
  | 'settings'
  | 'profile'
  | 'statuses'
  | 'calls'
  | 'archive'
  | 'instance'
  | 'logout'
  | 'language';

export interface SendingMethod {
  name: SendingMethodName;
  element: ReactElement;
}

export interface MessageServiceMethod {
  name: MessageServiceMethodName;
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

export interface SelectTemplateOption {
  template: WabaTemplateInterface;
  value: string;
  label: string;
  disabled: boolean;
}

export type Renderable = string | JSX.Element | JSX.Element[];

export interface GetTemplateMessageLayoutOptions {
  containerClassName?: string;
  templateType?: WabaTemplateTypeEnum;
  header: Renderable | null;
  content: Renderable;
  footer: Renderable | null;
  symbol: string;
  time?: string;
  mediaUrl?: string;
  buttons?: TemplateButtonInterface[];
  type?: TypeConnectionMessage;
}

export interface PollMessageData {
  name: string;
  options?: {
    optionName: string;
  }[];
  votes?: {
    optionName: string;
    optionVoters: string[];
  }[];
  multipleAnswers: boolean;
  stanzaId?: string;
}

export interface MessageDataForRender {
  idMessage: string;
  type: TypeConnectionMessage;
  typeMessage: TypeMessage;
  textMessage: string;
  senderName: string;
  isLastMessage: boolean;
  timestamp: number;
  jsonMessage: string;
  statusMessage?: StatusMessage;
  downloadUrl?: string;
  showSenderName: boolean;
  phone?: string;
  quotedMessage?: QuotedMessageInterface;
  templateMessage?: ParsedWabaTemplateInterface;
  interactiveButtonsMessage?: ParsedWabaTemplateInterface;
  caption?: string;
  fileName?: string;
  isDeleted?: boolean;
  isEdited?: boolean;
  pollMessageData?: PollMessageData;
}

export interface MessageTooltipMenuData {
  key: string;
  label: string;
  onClick: () => void;
}

export interface MessagesDate {
  date: string;
}

export type FormattedMessagesWithDate = (MessageInterface | MessagesDate)[];

export interface StateButtonParametersInterface
  extends Pick<HTMLAttributes<HTMLElement>, 'children'> {
  setState: Dispatch<SetStateAction<boolean>>;
}

export interface QrInstructionInterface {
  isVisibleQrInstruction: boolean;
  isNecessaryToLogout: boolean;
}

export interface ProgressBarPropertiesInterface extends Omit<ProgressProps, 'type' | 'percent'> {
  time: number;
  onFinish?: () => void;
}
