import { StatusJournalItemInterface } from 'types';

export const VIEW_TIMEOUT_MS = 5000;

const STATUS_FONTS = {
  SERIF: 'serif',
  SANS_SERIF: 'sans-serif',
  NORICAN_REGULAR: 'Norican',
  BRYNDAN_WRITE: 'cursive',
  OSWALD_HEAVY: 'Oswald',
} as const;

export const getStatusText = (status: StatusJournalItemInterface) => {
  if (status.typeMessage === 'extendedTextMessage') {
    return status.extendedTextMessage?.text || status.textMessage || '';
  }

  if (status.typeMessage === 'imageMessage') return status.caption || 'STATUS_IMAGE_FALLBACK';
  if (status.typeMessage === 'videoMessage') return status.caption || 'STATUS_VIDEO_FALLBACK';

  return status.caption || 'STATUS_AUDIO_FALLBACK';
};

export const formatStatusDate = (timestamp?: number) => {
  if (!timestamp || !Number.isFinite(timestamp)) return '';

  const date = new Date(timestamp * 1000);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleString();
};

export const getAvatarTitle = (chatId?: string) => (chatId || '').replace('@c.us', '');

export const getStatusTitle = (status: StatusJournalItemInterface): string =>
  status.senderContactName ||
  status.senderName ||
  (status.chatId && !status.chatId.startsWith('optimistic-') ? status.chatId : status.senderId) ||
  '';

export const getStatusFontFamily = (font?: string) => {
  if (!font) return STATUS_FONTS.SANS_SERIF;
  return STATUS_FONTS[font as keyof typeof STATUS_FONTS] || STATUS_FONTS.SANS_SERIF;
};

export const normalizeStatusBackgroundColor = (value?: string) => {
  if (!value) return '#792138';

  const color = value.trim();
  if (!color) return '#792138';

  if (/^#[0-9a-f]{6}([0-9a-f]{2})?$/i.test(color)) return color;
  if (/^[0-9a-f]{6}([0-9a-f]{2})?$/i.test(color)) return `#${color}`;
  if (/^(rgb|rgba|hsl|hsla)\(/i.test(color)) return color;

  return '#792138';
};

export const isRenderableStatus = (status: StatusJournalItemInterface) =>
  status.typeMessage !== 'deletedMessage' &&
  Number.isFinite(status.timestamp) &&
  status.timestamp > 0 &&
  Boolean(status.idMessage);
