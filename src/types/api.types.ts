import { InstanceInterface } from 'types';

export interface UserInterface {
  idUser: string;
  apiTokenUser: string;
  login: string;
}

export interface SendingResponseInterface {
  idMessage: string;
}

export interface SendingBaseParametersInterface {
  chatId: string;
  message: string;
  quotedMessageId?: string;
  archiveChat?: boolean;
}

export interface SendMessageParametersInterface
  extends InstanceInterface,
    SendingBaseParametersInterface {
  linkPreview?: boolean;
  refetchLastMessages?: boolean;
}

// Todo interface for body
export interface ReceiveNotificationResponseInterface {
  receiptId: number;
  body: Record<string, any>;
}

export type DeleteNotificationParameters = InstanceInterface &
  Pick<ReceiveNotificationResponseInterface, 'receiptId'>;

export interface ResultResponseInterface {
  result: boolean;
}

export type TypeConnectionMessage = 'outgoing' | 'incoming';
export type StatusMessage = 'pending' | 'sent' | 'delivered' | 'read';
export type TypeMessage =
  | 'textMessage'
  | 'imageMessage'
  | 'videoMessage'
  | 'documentMessage'
  | 'audioMessage'
  | 'locationMessage'
  | 'contactMessage'
  | 'extendedTextMessage'
  | 'pollMessage'
  | 'deletedMessage'
  | 'editedMessage'
  | 'reactionMessage';

export type Contact = {
  displayName: string;
  vcard: string;
};

// Todo rewrite interface
export interface MessageInterface
  extends SendingResponseInterface,
    Partial<LocationInterface>,
    Pick<SendingBaseParametersInterface, 'chatId'> {
  type: TypeConnectionMessage;
  timestamp: number;
  statusMessage?: StatusMessage;
  typeMessage: TypeMessage;
  senderId?: string;
  senderName?: string;
  senderContactName?: string;
  textMessage?: string;
  caption?: string;
  contact?: Contact;
  extendedTextMessage?: ExtendedTextMessage;
  quotedMessage?: QuotedMessageInterface;
  downloadUrl?: string;
  location?: LocationInterface;
  fileName?: string;
}

export interface QuotedMessageInterface extends MessageInterface {
  participant?: string;
  senderName: string;
}

export type GetChatHistoryResponse = MessageInterface[];

export interface LocationInterface {
  nameLocation?: string;
  address?: string;
  latitude: string;
  longitude: string;
  jpegThumbnail: string;
}

export type ExtendedTextMessage = {
  text: string;
  description: string;
  title: string;
  previewType: string;
  jpegThumbnail: string;
};

export interface GetChatHistoryParametersInterface
  extends InstanceInterface,
    Pick<SendingBaseParametersInterface, 'chatId'> {
  count?: number;
}

export type GetChatInformationParameters = Pick<SendingBaseParametersInterface, 'chatId'> &
  SendingResponseInterface &
  InstanceInterface;

export interface LastMessagesParametersInterface extends InstanceInterface {
  minutes?: number;
}

export interface GroupBaseParametersInterface extends InstanceInterface {
  groupId: string;
}

export interface GetGroupDataResponseInterface
  extends Pick<GroupBaseParametersInterface, 'groupId'> {
  owner: string;
  subject: string;
  creation: string;
  participants: GroupParticipantInterface[];
  subjectTime: number;
  subjectOwner: string;
  groupInviteLink: string;
}

export interface GroupParticipantInterface {
  id: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

export interface CheckWhatsappParametersInterface extends InstanceInterface {
  phoneNumber: string;
}

export interface CheckWhatsappResponseInterface {
  existsWhatsapp: boolean;
}

export type RequestWithChatIdParameters = InstanceInterface &
  Pick<SendingBaseParametersInterface, 'chatId'>;

export interface GetAvatarResponseInterface {
  existsWhatsapp: boolean;
  urlAvatar: string;
  reason: 'bad request data' | 'get avatar timeout limit exceeded';
}

export interface GetContactInfoResponseInterface
  extends Pick<SendingBaseParametersInterface, 'chatId'> {
  avatar: string;
  name: string;
  contactName?: string;
  email: string;
  category: string;
  description: string;
  products: ProductInterface[];
  lastSeen: string;
  isArchive: boolean;
  isDisappearing: boolean;
  isMute: boolean;
  messageExpiration: number;
  muteExpiration: number;
}

interface ProductInterface {
  id: number;
  imageUrls: Record<string, unknown>;
  availability: string;
  reviewStatus: Record<string, unknown>;
  name: string;
  description: string;
  price: string;
  isHidden: boolean;
}

export interface SendFileByUploadResponseInterface extends SendingResponseInterface {
  urlFile: string;
}

export interface SendFileByUploadParametersInterface
  extends InstanceInterface,
    Pick<SendingBaseParametersInterface, 'chatId' | 'quotedMessageId'>,
    SendingBaseFileParametersInterface {
  file: File;
}

export interface SendingBaseFileParametersInterface {
  fileName?: string;
  caption?: string;
}

export interface SendContactParametersInterface
  extends InstanceInterface,
    Pick<SendingBaseParametersInterface, 'chatId' | 'quotedMessageId'> {
  contact: ContactInterface;
}

export interface ContactInterface {
  phoneContact: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  company?: string;
}

export interface SendLocationParametersInterface
  extends InstanceInterface,
    Pick<SendingBaseParametersInterface, 'chatId' | 'quotedMessageId'> {
  nameLocation?: string;
  address?: string;
  latitude: string;
  longitude: string;
}

export interface SendPollParametersInterface
  extends InstanceInterface,
    Pick<SendingBaseParametersInterface, 'chatId' | 'message' | 'quotedMessageId'> {
  multipleAnswers?: boolean;
  options: { optionName: string }[];
}

export enum StateInstanceEnum {
  Authorized = 'authorized',
  NotAuthorized = 'notAuthorized',
  Blocked = 'blocked',
  SleepMode = 'sleepMode',
  Starting = 'starting',
  YellowCard = 'yellowCard',
  PendingCode = 'pendingCode',
}

export interface GetStateInstanceResponseInterface {
  stateInstance: StateInstanceEnum;
}

export enum AppMethodsEnum {
  GetInstances = 'user.instances.list',
  Login = 'loginUser',
  Registration = 'registerUser',
  Verify = 'verifyUser',
  Recover = 'recoverUser',
}

export type AppApiResponse<Data> = AppApiSuccessResponseInterface<Data> | AppApiErrorResponse;

export interface AppApiSuccessResponseInterface<Data> {
  result: true;
  data: Data;
  error: object;
}

export interface AppApiErrorResponse {
  result: false;
  data: object;
  error: {
    code: number;
    description: string;
  };
}

export interface UserLoginDataInterface extends Pick<UserInterface, 'login'> {
  password: string;
}
export enum TariffsEnum {
  Developer = 'DEVELOPER',
  Business = 'BUSINESS',
  BusinessUSD = 'BUSINESS_USD',
  BusinessKZT = 'BUSINESS_KZT',
}

export interface ExpandedInstanceInterface extends InstanceInterface {
  deleted: boolean;
  idInstanceDeleted: boolean;
  isExpired: boolean;
  isFree: boolean;
  isPartner: boolean;
  name: string;
  partnerUserUiid: string;
  tariff: TariffsEnum;
  timeCreated: string;
  timeDeleted: string;
  expirationDate: string;
  typeAccount: string;
  typeInstance: string;
}

export type GetInstancesResponse = AppApiResponse<ExpandedInstanceInterface[]>;
