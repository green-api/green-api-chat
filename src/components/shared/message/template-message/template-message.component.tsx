import { FC } from 'react';

import { useTranslation } from 'react-i18next';

import { LanguageLiteral, ParsedWabaTemplateInterface, TypeConnectionMessage } from 'types';
import {
  fillTemplateString,
  getFormattedMessage,
  getMessageDate,
  getTemplateMessageLayout,
} from 'utils';

interface TemplateMessageProps {
  templateMessage: ParsedWabaTemplateInterface;
  timestamp: number;
  type: TypeConnectionMessage;
  params?: string[];
}

const TemplateMessage: FC<TemplateMessageProps> = ({ templateMessage, timestamp, type }) => {
  const {
    t,
    i18n: { resolvedLanguage },
  } = useTranslation();

  const time = getMessageDate(timestamp * 1000, resolvedLanguage as LanguageLiteral, 'long');

  if (type === 'outgoing') {
    const header = templateMessage.header
      ? templateMessage.params
        ? getFormattedMessage(fillTemplateString(templateMessage.header, templateMessage.params))
        : getFormattedMessage(templateMessage.header)
      : null;
    const content = templateMessage.params
      ? getFormattedMessage(fillTemplateString(templateMessage.data, templateMessage.params))
      : getFormattedMessage(templateMessage.data);
    const footer = templateMessage.footer ? getFormattedMessage(templateMessage.footer) : null;
    const mediaUrl = templateMessage.mediaUrl;
    const buttons = templateMessage.buttons;

    return getTemplateMessageLayout({
      header: header,
      content: content,
      footer: footer,
      mediaUrl: mediaUrl,
      buttons: buttons,
      time: time,
      type: type,
      symbol: t('SHOW_ALL_TEXT'),
    });
  }

  const header = templateMessage.header ? getFormattedMessage(templateMessage.header) : null;
  const content = getFormattedMessage(templateMessage.data);
  const footer = templateMessage.footer ? getFormattedMessage(templateMessage.footer) : null;
  const mediaUrl = templateMessage.mediaUrl;
  const buttons = templateMessage.buttons;

  return getTemplateMessageLayout({
    header: header,
    content: content,
    footer: footer,
    mediaUrl: mediaUrl,
    buttons: buttons,
    time: time,
    type: type,
    symbol: t('SHOW_ALL_TEXT'),
  });
};

export default TemplateMessage;
