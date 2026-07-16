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
  const [identifier, parsedSuffix] = splitChatId(value, defaultSuffix);
  const [suffix, setSuffix] = useState<ChatIdSuffix>(
    suffixes.includes(parsedSuffix) ? parsedSuffix : defaultSuffix
  );

  useEffect(() => {
    if (value && suffixes.includes(parsedSuffix) && parsedSuffix !== suffix) {
      setSuffix(parsedSuffix);
    }
  }, [parsedSuffix, suffix, suffixes, value]);

  const handleIdentifierChange = (nextValue: string) => {
    const normalizedValue = normalizeChatIdIdentifier(nextValue, suffix);
    onChange?.(normalizedValue ? `${normalizedValue}${suffix}` : '');
  };

  const handleSuffixChange = (nextSuffix: ChatIdSuffix) => {
    setSuffix(nextSuffix);
    const normalizedValue = normalizeChatIdIdentifier(identifier, nextSuffix);
    onChange?.(normalizedValue ? `${normalizedValue}${nextSuffix}` : '');
  };

  const resolvedPlaceholder =
    placeholder ??
    (suffix === '@lid'
      ? t('CHAT_ID_LID_PLACEHOLDER', 'LID')
      : t('CHAT_ID_PHONE_PLACEHOLDER', 'Номер телефона'));

  return (
    <Input
      {...inputProperties}
      value={identifier}
      onChange={(event) => handleIdentifierChange(event.target.value)}
      type={suffix === '@lid' ? 'text' : 'tel'}
      placeholder={resolvedPlaceholder}
      addonAfter={
        <Select<ChatIdSuffix>
          aria-label={t('CHAT_ID_TYPE_LABEL', 'Тип идентификатора')}
          value={suffix}
          onChange={handleSuffixChange}
          variant="borderless"
          popupMatchSelectWidth={false}
          options={suffixes.map((item) => ({ value: item, label: item }))}
        />
      }
    />
  );
};

export default ChatIdInput;
