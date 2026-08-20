import { MessageInterface, TelegramChatType } from 'types';

type ChatTypeLike =
  | TelegramChatType
  | MessageInterface['chatType']
  | MessageInterface['senderType']
  | undefined;

export function isBotChatType(type: ChatTypeLike): boolean {
  return type === 'bot';
}

export function isChannelChatType(type: ChatTypeLike): boolean {
  return type === 'channel';
}
