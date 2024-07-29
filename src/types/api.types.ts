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
  body: Record<string, unknown>;
}

export type DeleteNotificationParameters = InstanceInterface &
  Pick<ReceiveNotificationResponseInterface, 'receiptId'>;

export interface ResultResponseInterface {
  result: boolean;
}

export type TypeConnectionMessage = 'outgoing' | 'incoming';
export type StatusMessage = 'outgoing' | 'pending' | 'sent' | 'delivered' | 'read';
export type TypeMessage =
  | 'textMessage'
  | 'imageMessage'
  | 'videoMessage'
  | 'documentMessage'
  | 'audioMessage'
  | 'locationMessage'
  | 'contactMessage'
  | 'extendedTextMessage';

export type Contact = {
  displayName: string;
  vcard: string;
};

// Todo rewrite interface
export interface MessageInterface
  extends SendingResponseInterface,
    LocationInterface,
    Pick<SendingBaseParametersInterface, 'chatId'> {
  type: TypeConnectionMessage;
  timestamp: number;
  statusMessage: StatusMessage;
  typeMessage: TypeMessage;
  senderId?: string;
  senderName?: string;
  textMessage?: string;
  caption?: string;
  contact?: Contact;
  extendedTextMessage?: ExtendedTextMessage;
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
  count: number;
}

export type GetChatInformationParameters = Pick<SendingBaseParametersInterface, 'chatId'> &
  SendingResponseInterface &
  InstanceInterface;

export interface LastMessagesParametersInterface extends InstanceInterface {
  minutes: number;
}
