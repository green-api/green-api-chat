import { forwardRef, useState } from 'react';

import { Input } from 'antd';
import { useTranslation } from 'react-i18next';

import { useAppSelector } from 'hooks';
import { selectMiniVersion } from 'store/slices/chat.slice';

interface TextAreaProps {
  value?: string;
  onChange?: (value: string) => void;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(({ value, onChange }, ref) => {
  const isMiniVersion = useAppSelector(selectMiniVersion);
  const { t } = useTranslation();

  const [newValue, setValue] = useState(value || '');

  return (
    <Input.TextArea
      ref={ref}
      style={{ height: isMiniVersion ? '' : '42px !important' }}
      autoSize={{ minRows: isMiniVersion ? 5 : 1, maxRows: 5 }}
      maxLength={500}
      placeholder={t('MESSAGE_PLACEHOLDER')}
      onKeyDown={(e) => {
        if (e.ctrlKey && e.key === 'Enter') {
          setValue((value) => value + '\n');
        }
      }}
      onPressEnter={(e) => e.preventDefault()}
      value={newValue}
      onChange={(e) => {
        setValue(e.target.value);

        if (typeof onChange === 'function') {
          onChange(e.target.value);
        }
      }}
    />
  );
});

export default TextArea;
