import { Avatar, Flex } from 'antd';

import emptyAvatarButAvailable from 'assets/emptyAvatarButAvailable.svg';
import { useAppSelector } from 'hooks';
import { useInstanceSettings } from 'hooks/use-instance-settings.hook';
import { useIsMaxInstance } from 'hooks/use-is-max-instance';
import { useGetAvatarQuery } from 'services/green-api/endpoints';
import { selectInstance } from 'store/slices/instances.slice';

export const AddStatus = () => {
  const { settings } = useInstanceSettings();
  const isMax = useIsMaxInstance();
  const selectedInstance = useAppSelector(selectInstance);

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
  return (
    <Flex gap={10}>
      <Avatar src={avatar?.urlAvatar?.trim() ? avatar.urlAvatar : emptyAvatarButAvailable} />
    </Flex>
  );
};
