import { FC, useState } from 'react';

import { UserAddOutlined } from '@ant-design/icons';
import { Flex } from 'antd';
import { Header } from 'antd/es/layout/layout';
import { useTranslation } from 'react-i18next';

import AsideAddNewChat from './aside-add-new-chat.component';

const AsideHeader: FC = () => {
  const { t } = useTranslation();

  const [isVisible, setIsVisible] = useState(false);

  return (
    <Header>
      <Flex justify="space-between">
        <h1>{t('CHAT_HEADER')}</h1>
        <UserAddOutlined style={{ fontSize: 20 }} onClick={() => setIsVisible(true)} />
      </Flex>
      <AsideAddNewChat isVisible={isVisible} setIsVisible={setIsVisible} />
    </Header>
  );
};

export default AsideHeader;
