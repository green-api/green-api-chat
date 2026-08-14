import { FC, useEffect, useState } from 'react';

import { Input, Select } from 'antd';
import type { InputProps } from 'antd';
import { useTranslation } from 'react-i18next';

import { ChatIdSuffix, normalizeChatIdIdentifier, splitChatId } from 'utils/chat-id.utils';

interface ChatIdInputProps extends Omit<InputProps, 'addonAfter' | 'onChange' | 'type' | 'value'> {
  value?: string;
  onChange?: (value: string) => void;
  suffixes?: ChatIdSuffix[];
  defaultSuffix?: ChatIdSuffix;
}

const ChatIdInput: FC<ChatIdInputProps> = ({
  value = '',
  onChange,
  suffixes = ['@c.us', '@g.us', '@lid'],
  defaultSuffix = '@c.us',
  placeholder,
  ...inputProperties
}) => {
  const { t } = useTranslation();
  const hasSuffixes = suffixes.length > 0;
  const [identifier, parsedSuffix] = hasSuffixes
    ? splitChatId(value, defaultSuffix)
    : [value, defaultSuffix];
  const [suffix, setSuffix] = useState<ChatIdSuffix>(
    suffixes.includes(parsedSuffix) ? parsedSuffix : defaultSuffix
  );

  useEffect(() => {
    if (hasSuffixes && value && suffixes.includes(parsedSuffix) && parsedSuffix !== suffix) {
      setSuffix(parsedSuffix);
    }
  }, [hasSuffixes, parsedSuffix, suffix, suffixes, value]);

  const handleIdentifierChange = (nextValue: string) => {
    if (!hasSuffixes) {
      onChange?.(nextValue.replace(/\D/g, ''));

      return;
    }

    const normalizedValue = normalizeChatIdIdentifier(nextValue, suffix);
    onChange?.(normalizedValue ? `${normalizedValue}${suffix}` : '');
  };

  const handleSuffixChange = (nextSuffix: ChatIdSuffix) => {
    setSuffix(nextSuffix);
    const normalizedValue = normalizeChatIdIdentifier(identifier, nextSuffix);
    onChange?.(normalizedValue ? `${normalizedValue}${nextSuffix}` : '');
  };

  const suffixPlaceholders: Record<ChatIdSuffix, string> = {
    '@c.us': t('CHAT_ID_PHONE_PLACEHOLDER', 'Номер телефона'),
    '@g.us': t('CHAT_ID_GROUP_PLACEHOLDER', 'Идентификатор группы'),
    '@lid': t('CHAT_ID_LID_PLACEHOLDER', 'LID'),
  };

  const resolvedPlaceholder = placeholder ?? (hasSuffixes ? suffixPlaceholders[suffix] : undefined);

  return (
    <Input
      {...inputProperties}
      value={identifier}
      onChange={(event) => handleIdentifierChange(event.target.value)}
      type={hasSuffixes && suffix === '@lid' ? 'text' : 'tel'}
      placeholder={resolvedPlaceholder}
      addonAfter={
        hasSuffixes ? (
          <Select<ChatIdSuffix>
            aria-label={t('CHAT_ID_TYPE_LABEL', 'Тип идентификатора')}
            value={suffix}
            onChange={handleSuffixChange}
            variant="borderless"
            popupMatchSelectWidth={false}
            options={suffixes.map((item) => ({ value: item, label: item }))}
          />
        ) : undefined
      }
    />
  );
};

export default ChatIdInput;
