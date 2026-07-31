export const CHAT_ID_SUFFIXES = ['@c.us', '@g.us', '@lid'] as const;

export type ChatIdSuffix = (typeof CHAT_ID_SUFFIXES)[number];

export const splitChatId = (
  chatId = '',
  defaultSuffix: ChatIdSuffix = '@c.us'
): [string, ChatIdSuffix] => {
  const suffix = CHAT_ID_SUFFIXES.find((item) => chatId.toLowerCase().endsWith(item));

  if (!suffix) return [chatId, defaultSuffix];

  return [chatId.slice(0, -suffix.length), suffix];
};

export const normalizeChatIdIdentifier = (value: string, suffix: ChatIdSuffix): string => {
  if (suffix === '@lid') return value.replaceAll(/[^\w-]/g, '');
  if (suffix === '@g.us') return value.replaceAll(/[^\d-]/g, '');

  return value.replaceAll(/\D/g, '');
};

export const ensureChatIdSuffix = (chatId: string, defaultSuffix: ChatIdSuffix = '@c.us') => {
  const trimmedValue = chatId.trim();

  if (!trimmedValue || CHAT_ID_SUFFIXES.some((suffix) => trimmedValue.endsWith(suffix))) {
    return trimmedValue;
  }

  return `${trimmedValue}${defaultSuffix}`;
};

export const isLidChatId = (chatId: string) => chatId.toLowerCase().endsWith('@lid');
