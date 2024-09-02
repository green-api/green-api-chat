import { FC } from 'react';

import { Flex, Space, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import GreenApiLogo from 'assets/Logo_GREEN-API.svg';

const HomeView: FC = () => {
  const { t } = useTranslation();

  return (
    <Flex className="home-view" align="center" justify="center">
      <Space direction="vertical" align="center">
        <img src={GreenApiLogo} alt={'Green-API logo'} width={350} />
        <Typography.Text>{t('LOGO_TITLE')}</Typography.Text>
      </Space>
    </Flex>
  );
};

export default HomeView;
