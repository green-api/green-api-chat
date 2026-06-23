import { FC, useMemo } from 'react';

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import emptyAvatar from 'assets/emptyAvatarButAvailable.svg';
import AvatarImage from 'components/UI/avatar-image.component';
import { useActions, useAppSelector } from 'hooks';
import { useBreakpoint } from 'hooks/use-breakpoint.hook';
import { useInstanceSettings } from 'hooks/use-instance-settings.hook';
import { selectUserSideActiveMode } from 'store/slices/chat.slice';
import type { AsideItem } from 'types';

interface AsideItemProps {
  asideItem: AsideItem;
}

const SETTINGS_ITEMS = ['instance', 'profile', 'logout', 'language'] as AsideItem['item'][];

const AsideItem: FC<AsideItemProps> = ({ asideItem }) => {
  const activeAsideItem = useAppSelector(selectUserSideActiveMode);

  const { setUserSideActiveMode, setActiveChat } = useActions();
  const { isMobile, isTablet } = useBreakpoint();

  const { t } = useTranslation();

  const { settings } = useInstanceSettings();

  const isActive = activeAsideItem === asideItem.item;

  const handleSetActive = () => {
    if (asideItem.item === 'settings') return;

    setUserSideActiveMode(asideItem.item);

    if (isMobile || isTablet) {
      setActiveChat(null);
    }
  };

  const avatar = useMemo<string>(() => {
    if (settings && settings.avatar) {
      return settings.avatar;
    }

    return emptyAvatar;
  }, [settings]);

  if (asideItem.item === 'profile') {
    return <AvatarImage src={avatar} size="large" />;
  }

  return (
    <a
      className={clsx(
        'aside-item flex-center',
        { active: isActive },
        activeAsideItem === asideItem.item && 'active-aside-item',
        SETTINGS_ITEMS.includes(activeAsideItem) &&
          asideItem.item === 'settings' &&
          'active-aside-item'
      )}
      onClick={handleSetActive}
      title={t(asideItem.title)}
    >
      {asideItem.icon}
    </a>
  );
};

export default AsideItem;
