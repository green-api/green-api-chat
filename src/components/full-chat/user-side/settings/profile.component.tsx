import { useEffect } from 'react';

import { PhoneOutlined } from '@ant-design/icons';
import { Avatar, Flex } from 'antd';
import { useTranslation } from 'react-i18next';

import emptyAvatarButAvailable from 'assets/emptyAvatarButAvailable.svg';
import AuthorizationStatus from 'components/instance-auth/authorization-status.component';
import { useActions, useAppSelector } from 'hooks';
import { useInstanceSettings } from 'hooks/use-instance-settings.hook';
import { useGetAvatarQuery } from 'services/green-api/endpoints';
import { selectInstance } from 'store/slices/instances.slice';

export const Profile = () => {
  const { setIsAuthorizingInstance } = useActions();
  const selectedInstance = useAppSelector(selectInstance);
  const { t } = useTranslation();
  const { settings } = useInstanceSettings();

  const { data: avatar } = useGetAvatarQuery(
    {
      ...selectedInstance,
      chatId: `${settings?.phone}@c.us`,
    },
    {
      skip:
        !selectedInstance?.idInstance || !selectedInstance?.apiTokenInstance || !settings?.phone,
    }
  );

  useEffect(() => {
    if (settings?.stateInstance === 'notAuthorized') {
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
          src={avatar?.urlAvatar ?? emptyAvatarButAvailable}
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
            gap={10}
            align="center"
            style={{ color: 'var(--secondary-text-color)', marginLeft: '2 rem' }}
          >
            <PhoneOutlined style={{ fontSize: '1.5rem' }} />
            <Flex vertical gap={4}>
              <div>{t('PHONE_NUMBER')}</div>
              <div>{settings?.phone}</div>
            </Flex>
          </Flex>
        </div>
      )}
    </Flex>
  );
};
