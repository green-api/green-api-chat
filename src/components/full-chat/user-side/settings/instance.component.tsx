import { Flex } from 'antd';
import { useTranslation } from 'react-i18next';

import SelectInstance from 'components/UI/select/select-instance.component';

export const InstanceSettings = () => {
  const { t } = useTranslation();

  return (
    <Flex className="settings" vertical>
      <p style={{ fontSize: '1.5rem', padding: '6px 20px' }}>{t('INSTANCE')}</p>
      <SelectInstance />
    </Flex>
  );
};
