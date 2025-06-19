import { CSSProperties } from 'react';

import { FormListProps } from 'antd/es/form';

import { FormRequestItemInterface } from 'types';

export type FormListFieldsProperties = {
  listProperties: Omit<FormListProps, 'children'>;
  items: FormRequestItemInterface[];
  containerStyles?: CSSProperties;
  containerClassNames?: string;
  minFields?: number;
  maxFields?: number;
};
