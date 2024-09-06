import { InstanceInterface } from 'types';

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
  quotedMessage?: MessageInterface;
  downloadUrl?: string;
  location?: LocationInterface;
  fileName?: string;
}

export type GetChatHistoryResponse = MessageInterface[];

export interface LocationInterface {
  nameLocation: string;
  address: string;
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
