import { FC } from 'react';

import { useTranslation } from 'react-i18next';

import { useIsMaxInstance } from 'hooks/use-is-max-instance';
import { useIsTelegramInstance } from 'hooks/use-is-telegram-instance';
import { ParsedWabaTemplateInterface, TypeConnectionMessage } from 'types';
import {
  fillTemplateString,
  getFormattedMessage,
  getInteractiveButtonsMessageLayout,
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
  const isMax = useIsMaxInstance();
  const isTelegram = useIsTelegramInstance();
  const enableMarkdownLinks = isMax || isTelegram;

  const message = interactiveButtonsMessage || templateMessage;

  const header = message.header
    ? message.params
      ? getFormattedMessage(fillTemplateString(message.header, message.params), {
          enableMarkdownLinks,
        })
      : getFormattedMessage(message.header, { enableMarkdownLinks })
    : null;

  const content = message.params
    ? getFormattedMessage(fillTemplateString(message.data, message.params), {
        enableMarkdownLinks,
      })
    : getFormattedMessage(message.data, { enableMarkdownLinks });

  const footer = message.footer
    ? getFormattedMessage(message.footer, { enableMarkdownLinks })
    : null;
  const mediaUrl = message.mediaUrl;
  const buttons = message.buttons;

  if (interactiveButtonsMessage) {
    return getInteractiveButtonsMessageLayout({
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
