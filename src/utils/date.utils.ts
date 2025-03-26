import {
  FormattedMessagesWithDate,
  LanguageLiteral,
  MessageDataForRender,
  MessageInterface,
} from 'types';

export function getUTCDate(date: Date, utc = 3) {
  const offset = date.getTimezoneOffset() / 60 + utc;

  return new Date(date.getTime() + offset * 3600 * 1000);
}

export function formatDate(
  timeCreated: number | string | Date,
  language: LanguageLiteral = 'en',
  format: 'short' | 'long' = 'short'
) {
  const options: Intl.DateTimeFormatOptions =
    format === 'short'
      ? {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }
      : {
          weekday: 'short',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        };

  return new Date(timeCreated).toLocaleDateString(language, options);
}

export function getMessageDate(
  timestamp: number,
  usage: 'chatList' | 'chat',
  language: LanguageLiteral = 'en',
  format: 'short' | 'long' = 'short'
): string {
  const messageDate = formatDate(timestamp, language, 'short');
  const nowDate = formatDate(Date.now(), language, 'short');

  if (messageDate === nowDate || usage === 'chat') {
    const date = new Date(timestamp);

    return `0${date.getHours()}`.slice(-2) + ':' + `0${date.getMinutes()}`.slice(-2);
  }

  return formatDate(timestamp, language, format);
}

export function checkIfFifteenMinutesPassed(timestamp: number): boolean {
  const fifteenMinutesPassedTimestamp = timestamp + 900000;

  return Date.now() >= fifteenMinutesPassedTimestamp;
}

export function isMessageEditable(messageData: MessageDataForRender): boolean {
  const isFifteenMinutesPassed = checkIfFifteenMinutesPassed(messageData.timestamp * 1000);
  const isMessageDeleted = messageData.isDeleted;

  return !isFifteenMinutesPassed && !isMessageDeleted;
}

function groupedDays(
  messages: MessageInterface[],
  language: LanguageLiteral = 'en'
): Record<string, MessageInterface[]> {
  return messages.reduce<Record<string, MessageInterface[]>>((acc, message) => {
    let messageDay = formatDate(message.timestamp * 1000, language);

    const today = formatDate(Date.now(), language);
    const yesterday = formatDate(new Date().setDate(new Date().getDate() - 1), language);
    const rtf = new Intl.RelativeTimeFormat(language, { numeric: 'auto' });

    if (messageDay === today) {
      messageDay = rtf.format(0, 'day');
    }

    if (messageDay === yesterday) {
      messageDay = rtf.format(-1, 'day');
    }

    if (acc[messageDay]) {
      return { ...acc, [messageDay]: acc[messageDay].concat([message]) };
    }

    return { ...acc, [messageDay]: [message] };
  }, {});
}

export function formatMessages(
  messages: MessageInterface[],
  language: LanguageLiteral = 'en'
): FormattedMessagesWithDate {
  const days = groupedDays(messages, language);
  const sortedDays = Object.keys(days).sort(
    (x, y) => new Date(x).getTime() - new Date(y).getTime()
  );
  const items = sortedDays.reduce<FormattedMessagesWithDate>((acc, date) => {
    return acc.concat([{ date }, ...days[date]]);
  }, []);

  return items;
}
