import { Avatar, Flex } from 'antd';
import { useTranslation } from 'react-i18next';

import InstanceDangerZone from 'components/instance-danger-zone.component';
import SelectInstance from 'components/UI/select/select-instance.component';
import { useActions, useAppSelector } from 'hooks';
import { useIsMaxInstance } from 'hooks/use-is-max-instance';
import {
  useGetAccountSettingsQuery,
  useGetWaSettingsQuery,
  useLogoutMutation,
} from 'services/green-api/endpoints';
import { selectUserSideActiveMode } from 'store/slices/chat.slice';
import { selectInstance } from 'store/slices/instances.slice';
import { Profile } from './profile.component';

const Settings = () => {
  const { t } = useTranslation();

  const isMax = useIsMaxInstance();

  const active = useAppSelector(selectUserSideActiveMode);
  const selectedInstance = useAppSelector(selectInstance);
  const { setUserSideActiveMode } = useActions();

  const [logoutInstance, { isLoading: isLogouting }] = useLogoutMutation();

  const { data: waSettings } = useGetWaSettingsQuery(
    {
      ...selectedInstance,
    },
    { skip: !selectedInstance?.idInstance || !selectedInstance?.apiTokenInstance || isMax }
  );

  const { data: accountSettings } = useGetAccountSettingsQuery(
    {
      ...selectedInstance,
    },
    { skip: !selectedInstance?.idInstance || !selectedInstance?.apiTokenInstance || !isMax }
  );

  const settings = isMax ? accountSettings : waSettings;

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
    return (
      <Flex className="settings" vertical gap={10}>
        <p style={{ fontSize: '1.5rem' }}>{t('LOGOUT')}</p>
        <InstanceDangerZone
          onLogout={() => {
            logoutInstance({
              idInstance: selectedInstance.idInstance,
              apiTokenInstance: selectedInstance.apiTokenInstance,
              apiUrl: selectedInstance?.apiUrl,
              mediaUrl: selectedInstance?.mediaUrl,
            });
            setUserSideActiveMode('chats');
          }}
          isLogoutDisabled={isLogouting}
          isLogouting={isLogouting}
          instanceStatus={settings?.stateInstance}
        />
      </Flex>
    );
  }

  return null;
};

export default Settings;
