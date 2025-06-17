import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Form, Button, Flex } from 'antd';
import { useTranslation } from 'react-i18next';

import { DynamicButtonFields } from './dynamic-button-fields.component';
import { formDefaultLayout, formItemDefaultLayout, formItemMethodApiLayout } from 'configs';
import { WabaTemplateCategoryEnum } from 'types/waba.types';

interface TemplateButtonsFieldProperties {
  isRequired?: boolean;
  category?: WabaTemplateCategoryEnum;
  isReply?: boolean;
}

export const TemplateButtonsField = ({ category, isReply }: TemplateButtonsFieldProperties) => {
  const { t } = useTranslation();

  return (
    <Form.Item label="buttons" {...formItemDefaultLayout}>
      <Form.List name="buttons" initialValue={[{}]}>
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name }) => (
              <Flex key={key} align="baseline">
                <DynamicButtonFields isReply={isReply} index={name} category={category} />
                <MinusCircleOutlined style={{ marginLeft: 8 }} onClick={() => remove(name)} />
              </Flex>
            ))}
            <Form.Item>
              <Button
                type="dashed"
                onClick={() => add()}
                block
                icon={<PlusOutlined />}
                disabled={fields.length >= 3}
              >
                {t('ADD')}
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
    </Form.Item>
  );
};
