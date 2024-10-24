import { FC } from 'react';

import { Select, Spin } from 'antd';
import { useTranslation } from 'react-i18next';

import { useAppSelector } from 'hooks';
import { useGetTemplatesQuery } from 'services/green-api/endpoints';
import { selectInstance } from 'store/slices/instances.slice';
import { SelectTemplateOption } from 'types';

interface SelectTemplateProps {
  onSelect: (option: SelectTemplateOption) => void;
}

const SelectTemplate: FC<SelectTemplateProps> = ({ onSelect }) => {
  const instanceCredentials = useAppSelector(selectInstance);

  const { t } = useTranslation();

  const { data, isLoading } = useGetTemplatesQuery(instanceCredentials);

  if (isLoading) {
    return <Spin />;
  }

  const options = data?.templates.map((template) => ({
    template: template,
    value: template.templateId,
    label: template.elementName,
    disabled: template.status !== 'APPROVED',
  }));

  return (
    <Select
      showSearch
      placeholder={t('TEMPLATE_NAME_PLACEHOLDER')}
      options={options}
      filterOption={(inputValue, option) =>
        `${option?.template.elementName}`.includes(inputValue) ||
        `${option?.template.elementName.toLowerCase()}`.includes(inputValue.toLowerCase())
      }
      onSelect={(_, option) => onSelect(option)}
    />
  );
};

export default SelectTemplate;
