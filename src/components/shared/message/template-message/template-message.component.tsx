import { FC } from 'react';

import { useTranslation } from 'react-i18next';

import { ParsedWabaTemplateInterface, TypeConnectionMessage } from 'types';
import {
  fillTemplateString,
  getFormattedMessage,
  getInteractiveBunttonsMessageLayout,
  getTemplateMessageLayout,
} from 'utils';

interface BaseProps {
  type: TypeConnectionMessage;
  params?: string[];
}

type TemplateMessageProps =
  | ({
      templateMessage: ParsedWabaTemplateInterface;
      interactiveButtonsMessage?: never;
    } & BaseProps)
  | ({
      templateMessage?: never;
      interactiveButtonsMessage: ParsedWabaTemplateInterface;
    } & BaseProps);

const TemplateMessage: FC<TemplateMessageProps> = ({
  templateMessage,
  type,
  interactiveButtonsMessage,
}) => {
  const { t } = useTranslation();

  const message = interactiveButtonsMessage || templateMessage;

  const header = message.header
    ? message.params
      ? getFormattedMessage(fillTemplateString(message.header, message.params))
      : getFormattedMessage(message.header)
    : null;

  const content = message.params
    ? getFormattedMessage(fillTemplateString(message.data, message.params))
    : getFormattedMessage(message.data);

  const footer = message.footer ? getFormattedMessage(message.footer) : null;
  const mediaUrl = message.mediaUrl;
  const buttons = message.buttons;

  if (interactiveButtonsMessage) {
    return getInteractiveBunttonsMessageLayout({
      header,
      content,
      footer,
      mediaUrl,
      buttons,
      type,
      symbol: t('SHOW_ALL_TEXT'),
    });
  }

  return getTemplateMessageLayout({
    header,
    content,
    footer,
    mediaUrl,
    buttons,
    type,
    symbol: t('SHOW_ALL_TEXT'),
  });
};

export default TemplateMessage;
