import { FC } from 'react';

import { Alert } from 'antd';
import { useTranslation } from 'react-i18next';

const LeftGroupAlert: FC = () => {
  const { t } = useTranslation();

  return <Alert message={t('LEFT_THE_GROUP_ALERT_MESSAGE')} className="left-group-alert" />;
};

export default LeftGroupAlert;
