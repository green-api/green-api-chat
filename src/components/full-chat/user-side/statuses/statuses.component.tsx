import { Flex } from 'antd';
import { useTranslation } from 'react-i18next';

export const Statuses = () => {
  const { t } = useTranslation();
  return (
    <Flex className="statuses" vertical gap={20}>
      <p style={{ fontSize: '1.5rem' }}>{t('STATUSES')}</p>
      <div>123</div>
    </Flex>
  );
};
