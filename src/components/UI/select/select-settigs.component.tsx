import { GlobalOutlined, SettingOutlined } from '@ant-design/icons';
import { Dropdown, Flex } from 'antd';
import { useTranslation } from 'react-i18next';

import InstanceIcon from 'assets/instance-icon.svg?react';
import LogoutIcon from 'assets/logout-icon.svg?react';
import ProfileIcon from 'assets/profile-icon.svg?react';
import { useActions } from 'hooks';
import { useBreakpoint } from 'hooks/use-breakpoint.hook';
import { UserSideActiveMode } from 'types';

export const SettingsSelect = () => {
  const { setUserSideActiveMode, setActiveChat } = useActions();
  const { t } = useTranslation();
  const { isMobile } = useBreakpoint();

  const SETTINGS_SELECT_ITEMS = [
    {
      key: 'instance',
      label: (
        <Flex gap={10} align="center">
          <InstanceIcon />
          {t('INSTANCE')}
        </Flex>
      ),
    },
    {
      key: 'profile',
      label: (
        <Flex gap={10} align="center">
          <ProfileIcon width={24} style={{ padding: '2px 0' }} />
          {t('PROFILE_TITLE')}
        </Flex>
      ),
    },
    {
      key: 'language',
      label: (
        <Flex gap={10} align="center">
          <GlobalOutlined width={24} style={{ padding: '2px 4px', fontSize: 16 }} />
          {t('LANGUAGE')}
        </Flex>
      ),
    },

    { type: 'divider' as const, style: { backgroundColor: 'var(--icon-color)' } },
    {
      key: 'logout',
      label: (
        <Flex align="center" gap={10} style={{ margin: '4px 0' }}>
          <LogoutIcon width={24} />
          {t('LOGOUT')}
        </Flex>
      ),
      danger: true,
    },
  ];

  return (
    <Dropdown
      placement="top"
      menu={{
        items: SETTINGS_SELECT_ITEMS,
        onClick: ({ key }) => {
          setUserSideActiveMode(key as UserSideActiveMode);
          isMobile && setActiveChat(null);
        },
      }}
    >
      <SettingOutlined style={{ width: 24, height: 24 }} />
    </Dropdown>
  );
};
