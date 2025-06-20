import { CSSProperties, FC } from 'react';

import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Space } from 'antd';
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
        <>
          {fields.map(({ key, name: subGroupIndex, ...restField }) => (
            <Space
              key={key}
              style={{ display: 'flex', marginBottom: 8, ...containerStyles }}
              className={containerClassNames}
              align="baseline"
            >
              {items.map(({ children, key: groupKey, name = '', ...properties }) => (
                <Form.Item
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
                  {/* @ts-ignore */}
                  {children}
                </Form.Item>
              ))}

              {fields.length > minFields && (
                <MinusCircleOutlined onClick={() => remove(subGroupIndex)} />
              )}
            </Space>
          ))}

          {(!maxFields || fields.length < maxFields) && (
            <Form.Item>
              <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                {t('ADD')}
              </Button>
            </Form.Item>
          )}
        </>
      )}
    </Form.List>
  );
};

export default FormListFields;
