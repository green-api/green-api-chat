import { FC } from 'react';

import { Form } from 'antd';
import { FormInstance } from 'antd/es/form';
import { useTranslation } from 'react-i18next';

import { PreviewImageInput } from './preview-image-input.component';
import TextArea from 'components/UI/text-area.component';
import { formItemDefaultLayout } from 'configs';
import { ChatFormValues } from 'types';

interface CustomPreviewFieldsProps {
  form: FormInstance<ChatFormValues>;
  isBigPreview: boolean;
}

const CustomPreviewFields: FC<CustomPreviewFieldsProps> = ({ form, isBigPreview }) => {
  const { t } = useTranslation();

  return (
    <>
      <Form.Item
        {...formItemDefaultLayout}
        name={['customPreview', 'title']}
        key="customPreviewTitle"
        label={t('TITLE')}
        required
      >
        <TextArea />
      </Form.Item>

      <Form.Item
        {...formItemDefaultLayout}
        name={['customPreview', 'description']}
        key="customPreviewDescription"
        label={t('DESCRIPTION')}
        required
      >
        <TextArea />
      </Form.Item>

      <PreviewImageInput namePrefix={['customPreview']} form={form} isBigPreview={isBigPreview} />
    </>
  );
};

export default CustomPreviewFields;
