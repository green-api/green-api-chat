import { Flex } from 'antd';
import { useTranslation } from 'react-i18next';

import { AddStatus } from './add-status.component';
import StatusesHistory from './statuses-history.component';

export const Statuses = () => {
  const { t } = useTranslation();
  return (
    <Flex className="statuses" vertical gap={20}>
      <p style={{ fontSize: '1.5rem' }}>{t('STATUSES')}</p>
      <AddStatus />
      <StatusesHistory />
    </Flex>
  );
};
