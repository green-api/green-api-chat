import { FC, useState } from 'react';

import { LogoutOutlined, UserAddOutlined } from '@ant-design/icons';
import { Flex, Space, Image } from 'antd';
import { Header } from 'antd/es/layout/layout';
import { useTranslation } from 'react-i18next';

import AddNewChat from './add-new-chat.component';
import logo from 'assets/header-logo.png';
import { useActions } from 'hooks';

const ChatsHeader: FC = () => {
  const { t, i18n } = useTranslation();
  const { logout, setActiveChat, setSelectedInstance } = useActions();

  const [isVisible, setIsVisible] = useState(false);

  const dir = i18n.dir();

  const onLogoutClick = () => {
    setActiveChat(null);
    setSelectedInstance({ idInstance: 0, apiTokenInstance: '', apiUrl: '', mediaUrl: '' });
    logout();
  };

  return (
    <Header style={{ padding: '5px 37px' }}>
      <Flex justify="space-between">
        <Image src={logo} preview={false} width={60} height={60} />
        <Space>
          <a>
            <UserAddOutlined
              style={{ fontSize: 20 }}
              onClick={() => setIsVisible(true)}
              title={t('ADD_NEW_CHAT_HEADER')}
            />
          </a>
          <a>
            <LogoutOutlined
              style={{ fontSize: 20, transform: dir === 'rtl' ? 'rotateY(180deg)' : 'unset' }}
              onClick={onLogoutClick}
              title={t('LOGOUT')}
            />
          </a>
        </Space>
      </Flex>
      <AddNewChat isVisible={isVisible} setIsVisible={setIsVisible} />
    </Header>
  );
};

export default ChatsHeader;
