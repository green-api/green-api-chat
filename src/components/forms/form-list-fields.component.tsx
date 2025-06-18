import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Space } from 'antd';
import { useTranslation } from 'react-i18next';

import { FormListFieldsProperties } from './types';

const FormListFields = ({
  listProperties,
  items,
  containerStyles = {},
  containerClassNames = '',
  minFields = 0,
  maxFields,
}: FormListFieldsProperties) => {
  const { t } = useTranslation();

  const initialValue = [];

  for (let index = 0; index < minFields; index++) {
    initialValue.push('');
  }

  return (
    <Form.List {...listProperties} initialValue={initialValue}>
      {(fields, { add, remove }) => {
        return (
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
                    name={[subGroupIndex, name as string]}
                    key={groupKey + key}
                    normalize={(value, previousValue, allValues) => {
                      if (typeof properties.normalize === 'function') {
                        value = properties.normalize(value, previousValue, allValues);
                      }

                      return value;
                    }}
                  >
                    {groupKey === 'buttons-type' ? (
                      children
                    ) : (
                      <div>
                        {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                        {/* @ts-ignore */}
                        {children}
                      </div>
                    )}
                  </Form.Item>
                ))}
                {fields.length > minFields && (
                  <MinusCircleOutlined
                    onClick={() => {
                      remove(subGroupIndex);
                    }}
                  />
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
        );
      }}
    </Form.List>
  );
};

export default FormListFields;
