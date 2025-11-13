import { InstanceInterface, PollMessageData, TypeInstance } from 'types';

export interface UserInterface {
  idUser: string;
  apiTokenUser: string;
  login: string;
  projectId: string;
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

export type EditMessageParameters = GetChatInformationParameters & { message: string };

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
  | 'reactionMessage'
  | 'stickerMessage'
  | 'templateMessage'
  | 'templateButtonsReplyMessage'
  | 'interactiveButtons'
  | 'pollUpdateMessage';

export type Contact = {
  displayName: string;
  vcard: string;
};

export interface InteractiveButton {
  type: 'call' | 'url' | 'copy' | 'reply';
  buttonId: string;
  buttonText: string;
  copyCode?: string;
  phoneNumber?: string;
  url?: string;
}

interface InteractiveButtons {
  titleText?: string;
  contentText: string;
  footerText?: string;
  headerText?: string;
  buttons: InteractiveButton[];
}

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
  templateMessage?: TemplateMessageInterface;
  templateButtonReplyMessage?: TemplateButtonReplyMessage;
  interactiveButtons?: InteractiveButtons;
  downloadUrl?: string;
  location?: LocationInterface;
  fileName?: string;
  isDeleted?: boolean;
  isEdited?: boolean;
  editedMessageId?: string;
  deletedMessageId?: string;
  pollMessageData?: PollMessageData;
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

export interface ExtendedTextMessage {
  text: string;
  description: string;
  title: string;
  previewType: string;
  jpegThumbnail: string;
}

export type TemplateMessageInterface = IncomingTemplateMessage | OutgoingTemplateMessage;

export interface OutgoingTemplateMessage {
  templateId: string;
  params?: string[];
}

export interface IncomingTemplateMessage {
  contentText: string;
  titleText?: string;
  footerText?: string;
  mediaUrl?: string;
  buttons: {
    urlButton: IncomingTemplateButton;
    quickReplyButton: IncomingTemplateButton;
    callButton: IncomingTemplateButton;
  }[];
}

export interface IncomingTemplateButton {
  displayText: string;
  [key: string]: string;
}

export interface TemplateButtonReplyMessage {
  stanzaId: string;
  selectedIndex: number;
  selectedId: string;
  selectedDisplayText: string;
}

export interface GetChatHistoryParametersInterface
  extends InstanceInterface,
    Pick<SendingBaseParametersInterface, 'chatId'> {
  count?: number;
}

export type GetChatInformationParameters = { onlySenderDelete?: boolean } & Pick<
  SendingBaseParametersInterface,
  'chatId'
> &
  SendingResponseInterface &
  InstanceInterface;

export interface LastMessagesParametersInterface extends InstanceInterface {
  minutesToRefetch?: number;
  minutes?: number;
  allMessages?: boolean;
}

export interface GroupBaseParametersInterface extends InstanceInterface {
  groupId?: string;
  chatId?: string;
}

export interface UpdateGroupNameInterface extends GroupBaseParametersInterface {
  groupName: string;
}

export interface UpdateGroupNameResponseInterface {
  updateGroupName: boolean;
}

export interface GroupParticipantApiInterface extends GroupBaseParametersInterface {
  participantChatId: string;
}
export type SetGroupAdminInterface = GroupParticipantApiInterface;
export interface AddGroupParticipantResponseInterface {
  addParticipant: boolean;
}
export interface RemoveGroupParticipantResponseInterface {
  removeParticipant: boolean;
}

export interface SetGroupAdminResponseInterface {
  setGroupAdmin: boolean;
}
export interface RemoveGroupAdminResponseInterface {
  removeAdmin: boolean;
}

export interface SetGroupPictureInterface extends GroupBaseParametersInterface {
  file: File;
}

export interface SetGroupPictureResponseInterface {
  setGroupPicture: boolean;
  urlAvatar: string;
  reason: string;
}

export interface LeaveGroupResponseInterface {
  leaveGroup: boolean;
  removeAdmin?: boolean;
}

export type GetGroupDataResponseInterface =
  | GetGroupDataSuccessResponseInterface
  | GetGroupDataErrorResponse;

export interface GetGroupDataSuccessResponseInterface
  extends Pick<GroupBaseParametersInterface, 'groupId'> {
  owner: string;
  subject: string;
  creation: string;
  participants: GroupParticipantInterface[];
  subjectTime: number;
  subjectOwner: string;
  groupInviteLink: string;
  chatId?: string;
}

export type GetGroupDataErrorResponse = 'Error: item-not-found' | 'Error: forbidden';

export interface GroupParticipantInterface {
  id: string;
  chatId?: string;
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
  available: boolean;
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
  lastSeen: string | null;
  isArchive: boolean;
  isDisappearing: boolean;
  isBusiness: boolean;
  isMute: boolean;
  messageExpiration: number;
  muteExpiration: number | null;
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
  Suspended = 'suspended',
}

export interface GetStateInstanceResponseInterface {
  stateInstance: StateInstanceEnum;
}

export enum AppMethodsEnum {
  GetInstances = 'user.instances.list',
  Login = 'loginUser',
  Verify = 'verifyUser',
  GetProfileSettings = 'user.profile.getSettings',
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
  typeInstance: TypeInstance;
}

export type GetInstancesResponse = AppApiResponse<ExpandedInstanceInterface[]>;

export interface GetWaSettingsResponseInterface {
  stateInstance: StateInstanceEnum;
  avatar: string;
  phone: string;
  deviceId: string;
  chatId?: string;
}

export interface GetProfileBaseSettingsResponseInterface<T extends boolean> {
  country: string;
  language: string;
  isPartner: T;
  isWaba: boolean;
}

export type GetProfileSettingsResponse =
  | GetProfileBaseSettingsResponseInterface<false>
  | (GetProfileBaseSettingsResponseInterface<true> & { partnerToken: string });

export interface UploadFileParametersInterface extends InstanceInterface {
  file: File;
}

export interface SendFileByUrlParametersInterface
  extends InstanceInterface,
    Omit<SendingBaseParametersInterface, 'message'>,
    Required<Pick<SendingBaseFileParametersInterface, 'fileName'>>,
    Omit<SendingBaseFileParametersInterface, 'fileName'> {
  urlFile: string;
}

interface BaseButton {
  buttonId: string;
  buttonText: string;
  type: string;
}

interface CopyButton extends BaseButton {
  type: 'copy';
  copyCode: string;
}

interface CallButton extends BaseButton {
  type: 'call';
  phoneNumber: string;
}

interface UrlButton extends BaseButton {
  type: 'url';
  url: string;
}

interface ReplyButton extends BaseButton {
  type: 'reply';
  url: string;
}

export type Button = CopyButton | CallButton | UrlButton | ReplyButton;
export interface SendInteractiveButtonsInterface
  extends InstanceInterface,
    Pick<SendingBaseParametersInterface, 'chatId'> {
  header: string;
  footer: string;
  body: string;
  buttons: Button[];
}

export type FontType =
  | 'SERIF'
  | 'SANS_SERIF'
  | 'NORICAN_REGULAR'
  | 'BRYNDAN_WRITE'
  | 'OSWALD_HEAVY';

export interface SendTextStatusInterface extends InstanceInterface {
  message: string;
  backgroundColor?: string;
  font?: FontType;
  participants?: string[];
}

export interface SendVoiceStatusInterface extends InstanceInterface {
  urlFile: string;
  backgroundColor?: string;
  fileName: string;
  participants?: string[];
}

export interface DownloadFileResponseInterface {
  downloadUrl: string;
}

export interface QrWebsocketResponseInterface {
  type: 'qrCode' | 'error' | 'accountData' | 'alreadyLogged' | 'timeoutExpired' | 'timeout';
  message: string;
}

export interface GetQRResponseInterface {
  status: boolean;
  code: string;
}

export interface LogoutResponseInterface {
  isLogout: boolean;
}

export interface StartAuthorizationResponseInterface {
  status: boolean;
  data: {
    status: 'success' | 'fail';
    reason: string;
  };
}

export interface SendMaxAuthCodeParametersInterface extends InstanceInterface {
  code: string;
}

export type FlagRequest = 'yes' | 'no';
export interface GetSettingsResponseInterface {
  wid: string;
  typeAccount: string;
  typeInstance: string;
  webhookUrl: string;
  webhookUrlToken: string;
  delaySendMessagesMilliseconds: number;
  markIncomingMessagesReaded: FlagRequest;
  markIncomingMessagesReadedOnReply: FlagRequest;
  sharedSession: FlagRequest;
  countryInstance: string;
  outgoingWebhook: FlagRequest;
  outgoingMessageWebhook: FlagRequest;
  outgoingAPIMessageWebhook: FlagRequest;
  stateWebhook: FlagRequest;
  incomingWebhook: FlagRequest;
  incomingBlockWebhook: FlagRequest;
  deviceWebhook: FlagRequest;
  statusInstanceWebhook: FlagRequest;
  enableMessagesHistory: FlagRequest;
  keepOnlineStatus: FlagRequest;
  pollMessageWebhook: FlagRequest;
  incomingCallWebhook: FlagRequest;
  deletedMessageWebhook: FlagRequest;
  editedMessageWebhook: FlagRequest;
}

export interface ExpandedGetSettingsInterface
  extends GetSettingsResponseInterface,
    Pick<
      ExpandedInstanceInterface,
      'idInstance' | 'name' | 'tariff' | 'expirationDate' | 'isExpired'
    > {
  proxyInstance: string;
  avatarInfoWebhook: FlagRequest;
  pollMessageWebhook: FlagRequest;
  incomingCallWebhook: FlagRequest;
}

export type InstanceData = ExpandedGetSettingsInterface &
  Pick<
    ExpandedInstanceInterface,
    | 'deleted'
    | 'isFree'
    | 'isPartner'
    | 'partnerUserUiid'
    | 'timeCreated'
    | 'timeDeleted'
    | 'typeInstance'
  > &
  Pick<InstanceInterface, 'apiTokenInstance' | 'apiUrl' | 'mediaUrl'>;
