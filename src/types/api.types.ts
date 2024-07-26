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
