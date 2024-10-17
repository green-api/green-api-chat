import { FC, useMemo } from 'react';

import { useTranslation } from 'react-i18next';

import emptyAvatar from 'assets/emptyAvatar.png';
import AvatarImage from 'components/UI/avatar-image.component';
import { useActions, useAppSelector } from 'hooks';
import { useGetWaSettingsQuery } from 'services/green-api/endpoints';
import { selectUserSideActiveMode } from 'store/slices/chat.slice';
import { selectInstance } from 'store/slices/instances.slice';
import type { AsideItem } from 'types';

interface AsideItemProps {
  asideItem: AsideItem;
}

const AsideItem: FC<AsideItemProps> = ({ asideItem }) => {
  const instanceCredentials = useAppSelector(selectInstance);

  const activeAsideItem = useAppSelector(selectUserSideActiveMode);

  const { setUserSideActiveMode } = useActions();

  const { t } = useTranslation();

  const { data: waSettings } = useGetWaSettingsQuery(instanceCredentials, {
    skip: asideItem.item !== 'profile',
  });

  const isActive = activeAsideItem === asideItem.item;

  const avatar = useMemo<string>(() => {
    if (waSettings && waSettings.avatar) {
      return waSettings.avatar;
    }

    return emptyAvatar;
  }, [waSettings]);

  if (asideItem.item === 'profile') {
    return <AvatarImage src={avatar} size="large" />;
  }

  return (
    <a
      className={`aside-item ${isActive ? 'active' : ''} flex-center`}
      onClick={() => setUserSideActiveMode(asideItem.item)}
      title={t(asideItem.title)}
    >
      {asideItem.icon}
    </a>
  );
};

export default AsideItem;
