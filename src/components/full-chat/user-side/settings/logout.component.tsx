import { Flex } from 'antd';
import { useTranslation } from 'react-i18next';

import InstanceDangerZone from 'components/instance-danger-zone.component';
import { useActions, useAppSelector } from 'hooks';
import { useIsMaxInstance } from 'hooks/use-is-max-instance';
import {
  useGetAccountSettingsQuery,
  useGetWaSettingsQuery,
  useLogoutMutation,
} from 'services/green-api/endpoints';
import { selectInstance } from 'store/slices/instances.slice';

export const Logout = () => {
  const { t } = useTranslation();
  const selectedInstance = useAppSelector(selectInstance);

  const { setUserSideActiveMode } = useActions();

  const isMax = useIsMaxInstance();

  const { data: waSettings } = useGetWaSettingsQuery(
    { ...selectedInstance },
    { skip: !selectedInstance?.idInstance || !selectedInstance?.apiTokenInstance || isMax }
  );

  const { data: accountSettings } = useGetAccountSettingsQuery(
    { ...selectedInstance },
    { skip: !selectedInstance?.idInstance || !selectedInstance?.apiTokenInstance || !isMax }
  );

  const settings = isMax ? accountSettings : waSettings;

  const [logoutInstance, { isLoading: isLogouting }] = useLogoutMutation();

  const handleLogout = () => {
    logoutInstance({
      idInstance: selectedInstance.idInstance,
      apiTokenInstance: selectedInstance.apiTokenInstance,
      apiUrl: selectedInstance?.apiUrl,
      mediaUrl: selectedInstance?.mediaUrl,
    });
    setUserSideActiveMode('chats');
  };

  return (
    <Flex className="settings" vertical gap={10}>
      <p style={{ fontSize: '1.5rem' }}>{t('LOGOUT')}</p>
      <InstanceDangerZone
        onLogout={handleLogout}
        isLogoutDisabled={isLogouting}
        isLogouting={isLogouting}
        instanceStatus={settings?.stateInstance}
      />
    </Flex>
  );
};
