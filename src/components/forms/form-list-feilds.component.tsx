import { CSSProperties, FC } from 'react';

import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Flex, Form, Space } from 'antd';
import { FormListProps } from 'antd/es/form';
import { useTranslation } from 'react-i18next';

import { FormRequestItemInterface } from 'types';

export type FormListFieldsProperties = {
  listProperties: Omit<FormListProps, 'children'>;
  items: FormRequestItemInterface[];
  containerStyles?: CSSProperties;
  containerClassNames?: string;
  minFields?: number;
  maxFields?: number;
};

const FormListFields: FC<FormListFieldsProperties> = ({
  listProperties,
  items,
  containerStyles = {},
  containerClassNames = '',
  minFields = 0,
  maxFields,
}) => {
  const { t } = useTranslation();

  const initialValue = Array.from({ length: minFields }, () => '');

  const isSimpleStringList = items.length === 1 && !items[0].name;

  return (
    <Form.List {...listProperties} initialValue={initialValue}>
      {(fields, { add, remove }) => (
        <Flex vertical gap={20} style={{ margin: '0 30px' }}>
          {fields.map(({ key, name: subGroupIndex, ...restField }) => (
            <Flex
              key={key}
              style={{ display: 'flex', marginBottom: 8, ...containerStyles }}
              className={containerClassNames}
              align="center"
              gap={10}
            >
              {items.map(({ children, key: groupKey, name = '', ...properties }) => (
                <Form.Item
                  noStyle
                  {...restField}
                  {...properties}
                  key={groupKey + key}
                  name={isSimpleStringList ? subGroupIndex : [subGroupIndex, name as string]}
                  normalize={(value, previousValue, allValues) => {
                    if (typeof properties.normalize === 'function') {
                      return properties.normalize(value, previousValue, allValues);
                    }
                    return value;
                  }}
                >
                  {children}
                </Form.Item>
              ))}

              {fields.length > minFields && (
                <MinusCircleOutlined onClick={() => remove(subGroupIndex)} />
              )}
            </Flex>
          ))}

          {(!maxFields || fields.length < maxFields) && (
            <Form.Item>
              <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                {t('ADD')}
              </Button>
            </Form.Item>
          )}
        </Flex>
      )}
    </Form.List>
  );
};

export default FormListFields;
