import { Button, Flex, Form } from 'antd';
import { useTranslation } from 'react-i18next';

import { formDefaultLayout } from 'configs';

export const PreviewSizeSelect = () => {
  const { t } = useTranslation();

  const VALUES = [
    {
      value: 'small',
      label: t('PREVIEW_SIZE_SMALL'),
    },
    {
      value: 'large',
      label: t('PREVIEW_SIZE_LARGE'),
    },
  ];

  return (
    <>
      <Form.Item
        label={t('TYPE_PREVIEW')}
        key="typePreview"
        name="typePreview"
        initialValue="small"
        noStyle
      >
        <></>
      </Form.Item>
      <Form.Item shouldUpdate>
        {({ getFieldValue, setFieldValue }) => {
          const selectedSize = getFieldValue('typePreview');

          return (
            <Form.Item {...formDefaultLayout} label={t('TYPE_PREVIEW')}>
              <Flex gap={8} align="center">
                {VALUES.map((item) => (
                  <Button
                    key={item.value}
                    type={selectedSize === item.value ? 'primary' : 'default'}
                    onClick={() => setFieldValue('typePreview', item.value)}
                  >
                    {item.label}
                  </Button>
                ))}
              </Flex>
            </Form.Item>
          );
        }}
      </Form.Item>
    </>
  );
};
