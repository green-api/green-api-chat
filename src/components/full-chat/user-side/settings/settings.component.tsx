import { FC } from 'react';

import { Flex } from 'antd';
import { useTranslation } from 'react-i18next';

import SelectInstance from 'components/UI/select/select-instance.component';

const Settings: FC = () => {
  const { t } = useTranslation();

  return (
    <Flex className="settings" vertical>
      <h2>{t('INSTANCE')}</h2>
      <SelectInstance />
    </Flex>
  );
};

export default Settings;
