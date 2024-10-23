import { FC } from 'react';

import { useTranslation } from 'react-i18next';

import {
  LanguageLiteral,
  ParsedWabaTemplateInterface,
  TypeConnectionMessage,
  WabaTemplateTypeEnum,
} from 'types';
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
  jsonMessage: string;
  templateType: WabaTemplateTypeEnum;
  params?: string[];
}

const TemplateMessage: FC<TemplateMessageProps> = ({
  templateMessage,
  timestamp,
  type,
  templateType,
  params,
}) => {
  const {
    t,
    i18n: { resolvedLanguage },
  } = useTranslation();

  if (type === 'outgoing') {
    const header = templateMessage.header
      ? params
        ? getFormattedMessage(fillTemplateString(templateMessage.header, params))
        : getFormattedMessage(templateMessage.header)
      : null;
    const content = params
      ? getFormattedMessage(fillTemplateString(templateMessage.data, params))
      : getFormattedMessage(templateMessage.data);
    const footer = templateMessage.footer ? getFormattedMessage(templateMessage.footer) : null;
    const mediaUrl = templateMessage.mediaUrl;
    const buttons = templateMessage.buttons;

    const time = getMessageDate(timestamp * 1000, resolvedLanguage as LanguageLiteral, 'long');

    return getTemplateMessageLayout({
      containerClassName: 'message outgoing full p-10',
      templateType: templateType,
      header: header,
      content: content,
      footer: footer,
      mediaUrl: mediaUrl,
      buttons: buttons,
      time: time,
      symbol: t('SHOW_ALL_TEXT'),
    });
  }

  // return getTemplateMessageLayout({
  //   containerClassName: 'message outgoing p-10',
  //   templateType: templateType,
  //   header: header,
  //   content: content,
  //   footer: footer,
  //   mediaUrl: mediaUrl,
  //   buttons: buttons,
  //   time: time,
  //   symbol: t('SHOW_ALL_TEXT'),
  // });
};

export default TemplateMessage;
