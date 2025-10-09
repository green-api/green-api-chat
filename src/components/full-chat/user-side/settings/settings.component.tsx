import { Flex } from 'antd';
import { useTranslation } from 'react-i18next';

import { Logout } from './logout.component';
import { Profile } from './profile.component';
import SelectInstance from 'components/UI/select/select-instance.component';
import { useAppSelector } from 'hooks';
import { selectUserSideActiveMode } from 'store/slices/chat.slice';

const Settings = () => {
  const { t } = useTranslation();

  const active = useAppSelector(selectUserSideActiveMode);

  if (active === 'instance') {
    return (
      <Flex className="settings" vertical>
        <p style={{ fontSize: '1.5rem' }}>{t('INSTANCE')}</p>
        <SelectInstance />
      </Flex>
    );
  }

  if (active === 'profile') {
    return <Profile />;
  }

  if (active === 'logout') {
    return <Logout />;
  }

  return null;
};

export default Settings;
