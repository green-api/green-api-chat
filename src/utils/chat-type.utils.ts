import { MessageInterface, TelegramChatType } from 'types';

type ChatTypeLike =
  | TelegramChatType
  | MessageInterface['chatType']
  | MessageInterface['senderType']
  | undefined;

export function isBotChatType(type: ChatTypeLike): boolean {
  return type === 'bot';
}
