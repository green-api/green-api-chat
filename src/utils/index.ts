import { GREEN_API_INSTANCES_ROUTER } from 'configs';
import { useLazyGetGroupDataQuery } from 'services/green-api/endpoints';
import {
  GetChatHistoryResponse,
  GreenApiUrlsInterface,
  InstanceInterface,
  LanguageLiteral,
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

export function getMessageDate(
  timestamp: number,
  language: LanguageLiteral
): { date: string; styleWidth?: number } {
  const messageDate = formatDate(timestamp * 1000, language);
  const nowDate = formatDate(Date.now(), language);

  if (messageDate === nowDate) {
    return {
      date: new Date(timestamp * 1000).toLocaleTimeString().slice(0, 5),
    };
  }

  return {
    date: messageDate,
    styleWidth: 120,
  };
}
