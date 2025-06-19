import { FC } from 'react';

import { Select } from 'antd';
import { SelectProps } from 'antd/es/select';
import { useTranslation } from 'react-i18next';

const SelectParticipants: FC<SelectProps> = (properties) => {
  const { t } = useTranslation();

  return (
    <Select
      {...properties}
      className="w-100 text-center"
      popupClassName="text-center"
      defaultValue="all_contacts"
      options={[
        {
          label: t('SEND_ALL_CONTACTS'),
          value: 'all_contacts',
        },
        {
          label: t('SEND_ONLY_SPECIFIED_CONTACTS'),
          value: 'specified_contacts',
        },
      ]}
    />
  );
};

export default SelectParticipants;
