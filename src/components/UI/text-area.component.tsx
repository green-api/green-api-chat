import { forwardRef, useEffect, useState } from 'react';

import { Input } from 'antd';
import { TextAreaProps as AntdTextAreaProps } from 'antd/es/input/TextArea';
import { useTranslation } from 'react-i18next';

import { useAppSelector } from 'hooks';
import { selectMiniVersion } from 'store/slices/chat.slice';

interface TextAreaProps extends Omit<AntdTextAreaProps, 'onChange' | 'value'> {
  value?: string;
  onChange?: (value: string) => void;
  minRows?: number;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ value, onChange, minRows, ...props }, ref) => {
    const isMiniVersion = useAppSelector(selectMiniVersion);
    const { t } = useTranslation();

    const [newValue, setValue] = useState(value || '');

    const computedMinRows = typeof minRows === 'number' ? minRows : isMiniVersion ? 5 : 1;

    useEffect(() => {
      setValue(value || '');
    }, [value]);

    return (
      <Input.TextArea
        ref={ref}
        style={{
          height: isMiniVersion ? undefined : 42,
        }}
        autoSize={{ minRows: computedMinRows, maxRows: 5 }}
        maxLength={20_000}
        placeholder={t('MESSAGE_PLACEHOLDER')}
        onKeyDown={(event) => {
          if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            event.preventDefault();
            event.stopPropagation();

            const nextValue = `${newValue}\n`;

            setValue(nextValue);
            onChange?.(nextValue);
          }
        }}
        onPressEnter={(event) => event.preventDefault()}
        value={newValue}
        onChange={(event) => {
          setValue(event.target.value);
          onChange?.(event.target.value);
        }}
        {...props}
      />
    );
  }
);

export default TextArea;
