import { FC } from 'react';

import { Dropdown, Menu, Divider } from 'antd';
import { useTranslation } from 'react-i18next';

import SettignsIcon from 'assets/settings.svg?react';
import SelectInstance from 'components/UI/select/select-instance.component';

export const SettingsPopup: FC = () => {
  const { t } = useTranslation();

  const menuItems = (
    <Menu>
      <Menu.Item key="instance">
        <SelectInstance />
      </Menu.Item>
      <Menu.Item key="profile">{t('PROFILE_TITLE')}</Menu.Item>
      <Menu.Item key="language">{t('LANGUAGE')}</Menu.Item>
      <Divider style={{ margin: '8px 0' }} />
      <Menu.Item key="logout" danger>
        {t('LOGOUT')}
      </Menu.Item>
    </Menu>
  );

  return (
    <Dropdown overlay={menuItems} trigger={['click']} placement="topRight">
      <span className="cursor-pointer flex items-center">
        <SettignsIcon />
      </span>
    </Dropdown>
  );
};
