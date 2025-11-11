import { useEffect } from 'react';

import { PhoneOutlined } from '@ant-design/icons';
import { Avatar, Flex } from 'antd';
import { useTranslation } from 'react-i18next';

import emptyAvatarButAvailable from 'assets/emptyAvatarButAvailable.svg';
import AuthorizationStatus from 'components/instance-auth/authorization-status.component';
import { useActions } from 'hooks';
import { useInstanceSettings } from 'hooks/use-instance-settings.hook';
import { useIsMaxInstance } from 'hooks/use-is-max-instance';

export const Profile = () => {
  const { setIsAuthorizingInstance } = useActions();

  const { t } = useTranslation();

  const { settings } = useInstanceSettings();

  const isMax = useIsMaxInstance();

  useEffect(() => {
    if (settings?.stateInstance === 'notAuthorized' && !isMax) {
      setIsAuthorizingInstance(true);
    }
    return () => {
      setIsAuthorizingInstance(false);
    };
  }, []);

  return (
    <Flex gap={20} vertical>
      <Flex className="settings" vertical style={{ flex: '0 0 auto' }}>
        <p style={{ fontSize: '1.5rem' }}>{t('PROFILE_TITLE')}</p>
      </Flex>
      <div
        style={{ height: 150, backgroundColor: 'var(--profile-background)', position: 'relative' }}
      >
        <Avatar
          src={settings?.avatar ?? emptyAvatarButAvailable}
          size={115}
          style={{
            position: 'absolute',
            bottom: '-20%',
            left: '50%',
            transform: 'translateX(-50%)',
            border: '6px solid var(--main-background)',
          }}
        />
      </div>
      <AuthorizationStatus style={{ alignSelf: 'center', marginTop: 15 }} />
      {settings?.stateInstance === 'authorized' && (
        <div style={{ paddingLeft: '2rem' }}>
          <Flex
            gap={22}
            align="center"
            style={{ color: 'var(--secondary-text-color)', marginLeft: '2 rem' }}
          >
            <PhoneOutlined style={{ fontSize: '1.5rem' }} />
            <Flex vertical gap={12}>
              <div>{t('PHONE_NUMBER')}</div>
              <div>{settings?.phone}</div>
            </Flex>
          </Flex>
        </div>
      )}
    </Flex>
  );
};
