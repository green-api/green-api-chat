import { Avatar, Flex } from 'antd';
import { useTranslation } from 'react-i18next';

import emptyAvatarButAvailable from 'assets/emptyAvatarButAvailable.svg';
import { useAppSelector } from 'hooks';
import {
  useGetAvatarQuery,
  useGetContactInfoQuery,
  useGetWaSettingsQuery,
} from 'services/green-api/endpoints';
import { selectInstance } from 'store/slices/instances.slice';

export const Profile = () => {
  const selectedInstance = useAppSelector(selectInstance);
  const { t } = useTranslation();
  const { data: waSettings } = useGetWaSettingsQuery(
    {
      ...selectedInstance,
    },
    { skip: !selectedInstance?.idInstance || !selectedInstance?.apiTokenInstance }
  );

  const { data: contactInfo } = useGetContactInfoQuery(
    {
      ...selectedInstance,
      chatId: `${waSettings?.phone}@c.us`,
    },
    {
      skip:
        !selectedInstance?.idInstance || !selectedInstance?.apiTokenInstance || !waSettings?.phone,
    }
  );

  const { data: avatar } = useGetAvatarQuery(
    {
      ...selectedInstance,
      chatId: `${waSettings?.phone}@c.us`,
    },
    {
      skip:
        !selectedInstance?.idInstance || !selectedInstance?.apiTokenInstance || !waSettings?.phone,
    }
  );

  console.log(contactInfo, waSettings, avatar);
  return (
    <Flex gap={20} vertical>
      <Flex className="settings" vertical style={{ flex: '0 0 auto' }}>
        <p style={{ fontSize: '1.5rem' }}>{t('PROFILE_TITLE')}</p>
      </Flex>
      <div style={{ height: 150, backgroundColor: '#E9F2F5', position: 'relative' }}>
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
    </Flex>
  );
};
