import { i18n } from 'i18next';

import { GREEN_API_INSTANCES_ROUTER } from 'configs';
import {
  ApiErrorResponse,
  GetChatHistoryResponse,
  GreenApiUrlsInterface,
  InstanceInterface,
  LanguageLiteral,
  MessageData,
  MessageInterface,
} from 'types';

export function getGreenApiUrls(
  idInstance: InstanceInterface['idInstance']
): GreenApiUrlsInterface {
  if (`${idInstance}`.length === 4 && `${idInstance}`.indexOf('57') === 0) {
    return {
      api: GREEN_API_INSTANCES_ROUTER[0].api,
      media: GREEN_API_INSTANCES_ROUTER[0].media,
      qrHost: GREEN_API_INSTANCES_ROUTER[0].qrHost,
      qrHttpHost: GREEN_API_INSTANCES_ROUTER[0].qrHttpHost,
    };
  }

  const idInstanceCode = +`${idInstance}`.slice(0, 4);

  const route = GREEN_API_INSTANCES_ROUTER.find(({ instancesCodes }) => {
    const indexCode = instancesCodes.findIndex((value) => {
      if (Array.isArray(value)) return value[0] <= idInstanceCode && idInstanceCode <= value[1];

      return value === idInstanceCode;
    });

    return indexCode !== -1;
  });

  return route
    ? {
        api: route.api,
        media: route.media,
        qrHost: route.qrHost,
        qrHttpHost: route.qrHttpHost,
      }
    : {
        api: GREEN_API_INSTANCES_ROUTER[0].api,
        media: GREEN_API_INSTANCES_ROUTER[0].media,
        qrHost: GREEN_API_INSTANCES_ROUTER[0].qrHost,
        qrHttpHost: GREEN_API_INSTANCES_ROUTER[0].qrHttpHost,
      };
}

export function formatDate(
  timeCreated: number | string | Date,
  language: LanguageLiteral | undefined
) {
  switch (language) {
    case 'ru': {
      return new Date(timeCreated).toLocaleDateString(language, {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    }

    case 'he': {
      return new Date(timeCreated).toLocaleDateString(language, {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    }

    default: {
      return new Date(timeCreated).toLocaleDateString(language, {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    }
  }
}

export function getLastFiveChats(
  lastIncomingMessages: GetChatHistoryResponse,
  lastOutgoingMessages: GetChatHistoryResponse
): GetChatHistoryResponse {
  if (!lastIncomingMessages.length && !lastOutgoingMessages.length) {
    return [];
  }

  const allMessagesFilteredAndSorted = [...lastIncomingMessages, ...lastOutgoingMessages]
    .filter((message) => message.typeMessage !== 'reactionMessage')
    .sort((a, b) => b.timestamp - a.timestamp);

  const resultMap = new Map<string, MessageInterface>();

  for (const message of allMessagesFilteredAndSorted) {
    if (resultMap.size === 5) {
      break;
    }

    if (!resultMap.has(message.chatId)) {
      resultMap.set(message.chatId, message);
    }
  }

  return Array.from(resultMap.values());
}

export function updateLastChats(
  currentChats: MessageInterface[],
  lastIncomingMessages: GetChatHistoryResponse,
  lastOutgoingMessages: GetChatHistoryResponse
): GetChatHistoryResponse {
  const updates = [...lastIncomingMessages, ...lastOutgoingMessages];

  return getLastFiveChats(currentChats, updates);
}

export function getMessageDate(
  timestamp: number,
  language: LanguageLiteral
): { date: string; styleWidth?: number } {
  const messageDate = formatDate(timestamp, language);
  const nowDate = formatDate(Date.now(), language);

  if (messageDate === nowDate) {
    return {
      date: new Date(timestamp).toLocaleTimeString().slice(0, 5),
    };
  }

  return {
    date: messageDate,
    styleWidth: 120,
  };
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

export function getErrorMessage(error: unknown, t: i18n['t']): string | null {
  let errorMessage = '';
  if (!error || !isApiError(error)) {
    return null;
  }

  switch (error.status) {
    case 466:
      errorMessage = t('METHOD_QUOTA_EXCEEDED_ERROR');
      break;

    case 429:
      errorMessage = t('TOO_MANY_REQUESTS_ERROR');
      break;

    case 'FETCH_ERROR':
      errorMessage = t('FETCH_ERROR');
      break;

    default:
      errorMessage = t('UNKNOWN_ERROR');
  }

  return errorMessage;
}

export function getJSONMessage(message: MessageInterface): string {
  const copyMessage = structuredClone(message);

  if (copyMessage.jpegThumbnail) {
    copyMessage.jpegThumbnail = copyMessage.jpegThumbnail.slice(0, 50) + '...';
  }

  if (copyMessage.extendedTextMessage && copyMessage.extendedTextMessage.jpegThumbnail) {
    copyMessage.extendedTextMessage.jpegThumbnail =
      copyMessage.extendedTextMessage.jpegThumbnail.slice(0, 50) + '...';
  }

  if (copyMessage.extendedTextMessage && copyMessage.extendedTextMessage.text.length > 250) {
    copyMessage.extendedTextMessage.text =
      copyMessage.extendedTextMessage.text.slice(0, 250) + '...';
  }

  if (copyMessage.textMessage && copyMessage.textMessage.length > 250) {
    copyMessage.textMessage = copyMessage.textMessage.slice(0, 250) + '...';
  }

  if (copyMessage.caption && copyMessage.caption.length > 150) {
    copyMessage.caption = copyMessage.caption.slice(0, 150) + '...';
  }

  if (copyMessage.quotedMessage) {
    copyMessage.quotedMessage = JSON.parse(getJSONMessage(copyMessage.quotedMessage));
  }

  return JSON.stringify(copyMessage, null, 2);
}
