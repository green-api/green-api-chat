import { Flex } from 'antd';
import { useTranslation } from 'react-i18next';

import InstanceDangerZone from 'components/instance-danger-zone.component';
import { useActions, useAppDispatch, useAppSelector } from 'hooks';
import { useInstanceSettings } from 'hooks/use-instance-settings.hook';
import { useLogoutMutation } from 'services/green-api/endpoints';
import { selectInstance } from 'store/slices/instances.slice';
import { greenAPI } from 'services/green-api/green-api.service';

export const Logout = () => {
  const { t } = useTranslation();
  const selectedInstance = useAppSelector(selectInstance);

  const { setUserSideActiveMode } = useActions();

  const { settings } = useInstanceSettings();

  const [logoutInstance, { isLoading: isLogouting }] = useLogoutMutation();
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    logoutInstance({
      idInstance: selectedInstance.idInstance,
      apiTokenInstance: selectedInstance.apiTokenInstance,
      apiUrl: selectedInstance?.apiUrl,
      mediaUrl: selectedInstance?.mediaUrl,
    });
    setUserSideActiveMode('chats');
    dispatch(dispatch(greenAPI.util.resetApiState()));
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
