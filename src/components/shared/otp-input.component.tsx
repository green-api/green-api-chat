import { FC, useRef, useState } from 'react';

import { Input, Flex } from 'antd';
import type { InputRef } from 'antd';

interface OtpInputProperties {
  length?: number;
  onComplete?: (value: string) => void;
  disabled?: boolean;
}

export const OtpInput: FC<OtpInputProperties> = ({ length = 6, onComplete, disabled = false }) => {
  const [values, setValues] = useState<string[]>(() => Array.from({ length }, () => ''));
  const inputsReference = useRef<(InputRef | null)[]>([]);

  const realInput = (index: number) => inputsReference.current[index]?.input ?? null;

  const focusInput = (index: number) => {
    const element = realInput(index);
    if (!element) return;
    setTimeout(() => {
      element.focus();
      element.select();
    }, 0);
  };

  const firstEmptyIndex = () => {
    const index = values.indexOf('');
    return index === -1 ? length - 1 : index;
  };

  const handleChange = (index: number, rawValue: string) => {
    const gate = firstEmptyIndex();
    const value = rawValue.replaceAll(/\D/g, '');
    if (!value) return;
    if (value.length > 1) return;

    const newValues = [...values];

    const targetIndex = index > gate ? gate : index;

    newValues[targetIndex] = value;
    setValues(newValues);

    if (targetIndex < length - 1) {
      focusInput(targetIndex + 1);
    }

    const code = newValues.join('');
    if (code.length === length && !newValues.includes('')) {
      onComplete?.(code);
    }
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace') {
      if (values[index]) {
        const newValues = [...values];
        newValues[index] = '';
        setValues(newValues);
      } else if (index > 0) {
        const newValues = [...values];
        newValues[index - 1] = '';
        setValues(newValues);
        focusInput(index - 1);
      }
    }
    if (event.key === 'ArrowLeft' && index > 0) {
      focusInput(index - 1);
    }
    if (event.key === 'ArrowRight' && index < length - 1) {
      focusInput(index + 1);
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();

    const pasted = event.clipboardData.getData('text').replaceAll(/\D/g, '');
    if (!pasted) return;

    const newValues = [...values];
    let index_ = firstEmptyIndex();

    for (const char of pasted) {
      if (index_ >= length) break;
      newValues[index_] = char;
      index_++;
    }

    setValues(newValues);

    if (index_ < length) {
      focusInput(index_);
    }

    const code = newValues.join('');
    if (code.length === length && !newValues.includes('')) {
      onComplete?.(code);
    }
  };

  return (
    <Flex gap={8} justify="center">
      {values.map((value, index) => (
        <Input
          className="otp-input"
          key={index}
          ref={(element) => (inputsReference.current[index] = element)}
          value={value}
          maxLength={1}
          size="large"
          inputMode="numeric"
          pattern="[0-9]*"
          disabled={disabled}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={(event) => handlePaste(event)}
        />
      ))}
    </Flex>
  );
};
