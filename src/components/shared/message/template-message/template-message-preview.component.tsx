import { FC } from 'react';

import { useWatch } from 'antd/es/form/Form';
import useFormInstance from 'antd/es/form/hooks/useFormInstance';
import { useTranslation } from 'react-i18next';

import { useIsMaxInstance } from 'hooks/use-is-max-instance';
import { useIsTelegramInstance } from 'hooks/use-is-telegram-instance';
import { LanguageLiteral, ParsedWabaTemplateInterface, WabaTemplateInterface } from 'types';
import {
  fillTemplateString,
  getFormattedMessage,
  getMessageDate,
  getTemplateMessageLayout,
} from 'utils';

interface MessagePreviewProps {
  template: WabaTemplateInterface;
}

const TemplateMessagePreview: FC<MessagePreviewProps> = ({ template }) => {
  const {
    t,
    i18n: { resolvedLanguage },
  } = useTranslation();
  const isMax = useIsMaxInstance();
  const isTelegram = useIsTelegramInstance();
  const enableMarkdownLinks = isMax || isTelegram;

  const form = useFormInstance();

  const parsedTemplateData = JSON.parse(template.containerMeta) as ParsedWabaTemplateInterface;

  const params: string[] | undefined = useWatch('params', form)?.map(
    (param: { param: string }) => param.param
  );

  const templateType = template.templateType;
  const header = parsedTemplateData.header
    ? params
      ? getFormattedMessage(fillTemplateString(parsedTemplateData.header, params), {
          enableMarkdownLinks,
        })
      : getFormattedMessage(parsedTemplateData.header, { enableMarkdownLinks })
    : null;
  const content = params
    ? getFormattedMessage(fillTemplateString(parsedTemplateData.data, params), {
        enableMarkdownLinks,
      })
    : getFormattedMessage(parsedTemplateData.data, { enableMarkdownLinks });
  const footer = parsedTemplateData.footer
    ? getFormattedMessage(parsedTemplateData.footer, { enableMarkdownLinks })
    : null;
  const mediaUrl = parsedTemplateData.mediaUrl;
  const buttons = parsedTemplateData.buttons;

  const time = getMessageDate(Date.now(), 'chat', resolvedLanguage as LanguageLiteral, 'short');

  return getTemplateMessageLayout({
    containerClassName: 'message outgoing p-10',
    templateType: templateType,
    header: header,
    content: content,
    footer: footer,
    mediaUrl: mediaUrl,
    buttons: buttons,
    time: time,
    symbol: t('SHOW_ALL_TEXT'),
  });
};

export default TemplateMessagePreview;
