import { useEffect } from 'react';

import { useForm } from 'antd/es/form/Form';
import { useTranslation } from 'react-i18next';

export const useFormWithLanguageValidation = <T = unknown>() => {
  const [form] = useForm<T>();
  const {
    i18n: { resolvedLanguage },
  } = useTranslation();

  useEffect(() => {
    if (!form) return;

    for (const field of form.getFieldsError()) {
      if (field.errors.length > 0) form.validateFields([field.name]);
    }
  }, [resolvedLanguage]);

  return [form];
};
