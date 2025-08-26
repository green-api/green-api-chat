import {
  ApiErrorResponse,
  ChatType,
  GetContactInfoResponseInterface,
  GetGroupDataSuccessResponseInterface,
  MessageData,
  MessageInterface,
  MessagesDate,
  OutgoingTemplateMessage,
  TemplateMessageInterface,
  TypeConnectionMessage,
} from 'types';

export function isContactInfo(
  info: GetContactInfoResponseInterface | GetGroupDataSuccessResponseInterface
): info is GetContactInfoResponseInterface {
  return 'chatId' in info;
}

export function isOutgoingTemplateMessage(
  templateMessage: TemplateMessageInterface,
  type: TypeConnectionMessage
): templateMessage is OutgoingTemplateMessage {
  return type === 'outgoing';
}

export function isMessagesDate(message: MessageInterface | MessagesDate): message is MessagesDate {
  return 'date' in message;
}

export function isApiError(error: unknown): error is ApiErrorResponse {
  return (
    typeof error === 'object' &&
    error !== null &&
    ('data' in error || 'error' in error) &&
    'status' in error
  );
}

export function isConsoleMessageData(data: unknown): data is MessageData {
  return typeof data === 'object' && data !== null && 'type' in data && 'payload' in data;
}

export function isValidChatType(type: string): type is ChatType {
  return (
    type === 'tab' ||
    type === 'console-page' ||
    type === 'instance-view-page' ||
    type === 'partner-iframe' ||
    type === 'one-chat-only'
  );
}
