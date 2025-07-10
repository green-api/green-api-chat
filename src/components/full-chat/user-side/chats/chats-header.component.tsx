import { FC, useState } from 'react';

import { LogoutOutlined, UserAddOutlined } from '@ant-design/icons';
import { Flex, Image } from 'antd';
import { Header } from 'antd/es/layout/layout';
import { useTranslation } from 'react-i18next';

import AddNewChat from './add-new-chat.component';
import logo from 'assets/header-logo.png';
import { useActions } from 'hooks';
import { TariffsEnum } from 'types';

const ChatsHeader: FC = () => {
  const { t, i18n } = useTranslation();
  const { logout, setActiveChat, setSelectedInstance } = useActions();

  const [isVisible, setIsVisible] = useState(false);

  const dir = i18n.dir();

  const onLogoutClick = () => {
    setActiveChat(null);
    setSelectedInstance({
      idInstance: 0,
      apiTokenInstance: '',
      apiUrl: '',
      mediaUrl: '',
      tariff: TariffsEnum.Developer,
    });
    logout();
  };

  return (
    <Header style={{ padding: '5px 37px' }}>
      <Flex justify="space-between" align="center">
        <Image src={logo} preview={false} width={60} height={60} />
        <Flex align="center" justify="center" gap={10}>
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
        </Flex>
      </Flex>
      <AddNewChat isVisible={isVisible} setIsVisible={setIsVisible} />
    </Header>
  );
};

export default ChatsHeader;
