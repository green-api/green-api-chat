import { MessageInterface, ChatType } from 'types';

type ChatTypeLike =
  | ChatType
  | MessageInterface['chatType']
  | MessageInterface['senderType']
  | undefined;

export function isBotChatType(type: ChatTypeLike): boolean {
  return type === 'bot';
}

export function isChannelChatType(type: ChatTypeLike): boolean {
  return type === 'channel';
}
