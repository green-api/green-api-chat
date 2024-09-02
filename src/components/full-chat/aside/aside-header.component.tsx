import { FC } from 'react';

import { Header } from 'antd/es/layout/layout';
import { useTranslation } from 'react-i18next';

const AsideHeader: FC = () => {
  const { t } = useTranslation();

  return (
    <Header>
      <h1>{t('CHAT_HEADER')}</h1>
    </Header>
  );
};

export default AsideHeader;
