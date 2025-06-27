import { useEffect, useState } from 'react';

import { Flex, Form, Input, Select } from 'antd';
import { useWatch } from 'antd/es/form/Form';
import { useTranslation } from 'react-i18next';

import { TemplateButtonTypesEnum, WabaTemplateCategoryEnum } from 'types';

export const DynamicButtonFields = ({
  index,
  onChangeField,
  isReply,
}: {
  index: number;
  category?: WabaTemplateCategoryEnum;
  onChangeField?: (field: string, value: string) => void;
  isReply?: boolean;
}) => {
  const { t } = useTranslation();

  const type = useWatch(['buttons', index, 'type']);
  const category = useWatch(['category']);

  const [options, setOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    if (isReply) return;

    if (!category) {
      setOptions([
        { value: 'copy', label: 'Copy Code' },
        { value: 'call', label: 'Call Number' },
        { value: 'url', label: 'External URL' },
        { value: 'reply', label: 'Reply' },
      ]);
      return;
    }

    const newOptions = [
      { value: TemplateButtonTypesEnum.PhoneNumber, label: 'Phone Number' },
      { value: TemplateButtonTypesEnum.Url, label: 'URL' },
    ];

    if (
      category === WabaTemplateCategoryEnum.Marketing ||
      category === WabaTemplateCategoryEnum.Utility
    ) {
      newOptions.push({
        value: TemplateButtonTypesEnum.QuickReply,
        label: 'Quick Reply',
      });
    }

    if (category === WabaTemplateCategoryEnum.Authentication) {
      newOptions.push({ value: TemplateButtonTypesEnum.OTP, label: 'OTP' });
    }

    if (category) {
      setOptions(newOptions);
    }
  }, [category]);

  if (isReply) {
    return (
      <Flex gap={8}>
        <Form.Item
          name={[index, 'buttonText']}
          rules={[{ required: true, message: t('EMPTY_FIELD_ERROR') }]}
          normalize={(value) => {
            onChangeField?.('buttonText', value);
            return value;
          }}
        >
          <Input maxLength={100} placeholder={t('BUTTON_TEXT_PLACEHOLDER')} />
        </Form.Item>
      </Flex>
    );
  }

  return (
    <Flex gap={8} align="center">
      <Form.Item
        name={[index, 'type']}
        rules={[{ required: true, message: t('EMPTY_FIELD_ERROR') }]}
        normalize={(value) => {
          onChangeField?.('type', value);
          return value;
        }}
      >
        <Select placeholder={t('BUTTON_TYPE_PLACEHOLDER')} options={options} />
      </Form.Item>

      {type === TemplateButtonTypesEnum.OTP && (
        <Form.Item
          name={[index, 'otp_type']}
          rules={[{ required: true, message: t('EMPTY_FIELD_ERROR') }]}
          normalize={(value) => {
            onChangeField?.('otp_type', value);
            return value;
          }}
        >
          <Input maxLength={100} placeholder={t('BUTTON_OTP_TYPE_PLACEHOLDER')} />
        </Form.Item>
      )}

      {type !== TemplateButtonTypesEnum.OTP && (
        <Form.Item
          name={[index, 'buttonText']}
          rules={[{ required: true, message: t('EMPTY_FIELD_ERROR') }]}
          normalize={(value) => {
            onChangeField?.('buttonText', value);
            return value;
          }}
        >
          <Input maxLength={100} placeholder={t('BUTTON_TEXT_PLACEHOLDER')} />
        </Form.Item>
      )}

      {type &&
        type !== TemplateButtonTypesEnum.OTP &&
        type !== TemplateButtonTypesEnum.QuickReply &&
        type != 'reply' &&
        type !== 'copy' &&
        type !== 'call' &&
        type !== 'url' && (
          <Form.Item
            name={[index, 'value']}
            rules={[{ required: true, message: t('EMPTY_FIELD_ERROR') }]}
            normalize={(value) => {
              onChangeField?.('value', value);
              return value;
            }}
          >
            <Input maxLength={100} placeholder={t('BUTTON_VALUE_PLACEHOLDER')} />
          </Form.Item>
        )}

      {type === 'copy' && (
        <Form.Item
          name={[index, 'copyCode']}
          rules={[{ required: true, message: t('EMPTY_FIELD_ERROR') }]}
          normalize={(value) => {
            onChangeField?.('copyCode', value);
            return value;
          }}
        >
          <Input maxLength={100} placeholder="Enter copy code" />
        </Form.Item>
      )}

      {type === 'call' && (
        <Form.Item
          name={[index, 'phoneNumber']}
          rules={[{ required: true, message: t('EMPTY_FIELD_ERROR') }]}
          normalize={(value) => {
            onChangeField?.('phoneNumber', value);
            return value;
          }}
        >
          <Input maxLength={100} placeholder="Enter phone number" />
        </Form.Item>
      )}

      {type === 'url' && (
        <Form.Item
          name={[index, 'url']}
          rules={[{ required: true, message: t('EMPTY_FIELD_ERROR') }]}
          normalize={(value) => {
            onChangeField?.('url', value);
            return value;
          }}
        >
          <Input placeholder="Enter URL" />
        </Form.Item>
      )}
    </Flex>
  );
};
