import { SettingOutlined } from '@ant-design/icons';
import { Dropdown, Flex } from 'antd';
import { useTranslation } from 'react-i18next';

import InstanceIcon from 'assets/instance-icon.svg?react';
import LogoutIcon from 'assets/logout-icon.svg?react';
import ProfileIcon from 'assets/profile-icon.svg?react';
import { useActions } from 'hooks';
import { UserSideActiveMode } from 'types';

export const SettingsSelect = () => {
  const { setUserSideActiveMode } = useActions();
  const { t } = useTranslation();
  return (
    <Dropdown
      placement="top"
      menu={{
        items: [
          {
            key: 'instance',
            label: (
              <Flex gap={10} align="center">
                <InstanceIcon />
                {t('INSTANCE')}
              </Flex>
            ),
          },
          // {
          //   key: 'profile',
          //   label: (
          //     <Flex gap={10} align="center">
          //       <ProfileIcon width={24} style={{ padding: '2px 0' }} />
          //       {t('PROFILE')}
          //     </Flex>
          //   ),
          // },

          { type: 'divider' },
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
        ],
        onClick: ({ key }) => {
          setUserSideActiveMode(key as UserSideActiveMode);
        },
      }}
    >
      <SettingOutlined style={{ width: 24, height: 24 }} />
    </Dropdown>
  );
};
