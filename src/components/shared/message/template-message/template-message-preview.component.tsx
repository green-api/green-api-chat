import { FC } from 'react';

import { useWatch } from 'antd/es/form/Form';
import useFormInstance from 'antd/es/form/hooks/useFormInstance';
import { useTranslation } from 'react-i18next';

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

  const form = useFormInstance();

  const parsedTemplateData = JSON.parse(template.containerMeta) as ParsedWabaTemplateInterface;

  const params: string[] | undefined = useWatch('params', form)?.map(
    (param: { param: string }) => param.param
  );

  const templateType = template.templateType;
  const header = parsedTemplateData.header
    ? params
      ? getFormattedMessage(fillTemplateString(parsedTemplateData.header, params))
      : getFormattedMessage(parsedTemplateData.header)
    : null;
  const content = params
    ? getFormattedMessage(fillTemplateString(parsedTemplateData.data, params))
    : getFormattedMessage(parsedTemplateData.data);
  const footer = parsedTemplateData.footer ? getFormattedMessage(parsedTemplateData.footer) : null;
  const mediaUrl = parsedTemplateData.mediaUrl;
  const buttons = parsedTemplateData.buttons;

  const time = getMessageDate(Date.now(), resolvedLanguage as LanguageLiteral, 'short');

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
