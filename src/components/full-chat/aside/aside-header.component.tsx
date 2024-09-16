import { FC, useState } from 'react';

import { LogoutOutlined, UserAddOutlined } from '@ant-design/icons';
import { Flex, Space } from 'antd';
import { Header } from 'antd/es/layout/layout';
import { useTranslation } from 'react-i18next';

import AsideAddNewChat from './aside-add-new-chat.component';
import { useActions } from 'hooks';

const AsideHeader: FC = () => {
  const { t, i18n } = useTranslation();
  const { logout, setActiveChat } = useActions();

  const [isVisible, setIsVisible] = useState(false);

  const dir = i18n.dir();

  const onLogoutClick = () => {
    setActiveChat(null);
    logout();
  };

  return (
    <Header>
      <Flex justify="space-between">
        <h1>{t('CHAT_HEADER')}</h1>
        <Space>
          <UserAddOutlined
            style={{ fontSize: 20 }}
            onClick={() => setIsVisible(true)}
            title={t('ADD_NEW_CHAT_HEADER')}
          />
          <LogoutOutlined
            style={{ fontSize: 20, transform: dir === 'rtl' ? 'rotateY(180deg)' : 'unset' }}
            onClick={onLogoutClick}
            title={t('LOGOUT')}
          />
        </Space>
      </Flex>
      <AsideAddNewChat isVisible={isVisible} setIsVisible={setIsVisible} />
    </Header>
  );
};

export default AsideHeader;
