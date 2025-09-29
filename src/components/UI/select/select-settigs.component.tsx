import { SettingOutlined } from '@ant-design/icons';
import { Dropdown } from 'antd';

import { useActions } from 'hooks';
import { UserSideActiveMode } from 'types';

export const SettingsSelect = () => {
  const { setUserSideActiveMode } = useActions();
  return (
    <Dropdown
      placement="top"
      menu={{
        items: [
          { key: 'instance', label: 'Инстанс' },
          { key: 'profile', label: 'Профиль' },
          { key: 'business', label: 'Для бизнеса' },
          { type: 'divider' },
          { key: 'logout', label: 'Выйти' },
        ],
        onClick: ({ key }) => {
          setUserSideActiveMode(key as UserSideActiveMode);
        },
      }}
      arrow
    >
      <span>
        <SettingOutlined />
      </span>
    </Dropdown>
  );
};
