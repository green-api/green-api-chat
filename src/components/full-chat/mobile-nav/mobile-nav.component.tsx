import { FC, useEffect, useRef } from 'react';

import { Flex } from 'antd';

import AsideItem from '../aside/aside-item.component';
import { asideBottomIconItems, asideTopIconItems } from 'configs';
import { useAppSelector, useMediaQuery } from 'hooks';
import { selectActiveChat, selectType } from 'store/slices/chat.slice';
import { selectTypeInstance } from 'store/slices/instances.slice';
import type { AsideItem as AsideItemInterface } from 'types';

const MobileNav: FC = () => {
  const navRef = useRef<HTMLElement>(null);

  const type = useAppSelector(selectType);
  const typeInstance = useAppSelector(selectTypeInstance);
  const activeChat = useAppSelector(selectActiveChat);

  const isMobileLayout = useMediaQuery('(max-width: 975px)');

  const shouldRender = isMobileLayout && !activeChat;

  useEffect(() => {
    const root = document.documentElement;

    if (!shouldRender || !navRef.current) {
      root.style.setProperty('--mobile-nav-height', '0px');
      return;
    }

    const node = navRef.current;
    const updateHeight = () =>
      root.style.setProperty('--mobile-nav-height', `${node.offsetHeight}px`);

    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(node);

    return () => {
      observer.disconnect();
      root.style.setProperty('--mobile-nav-height', '0px');
    };
  }, [shouldRender]);

  if (!shouldRender) return null;

  const items = [...asideTopIconItems(type, typeInstance), ...asideBottomIconItems].filter(
    (item): item is AsideItemInterface => !!item
  );

  return (
    <nav ref={navRef} className="mobile-nav">
      <Flex className="mobile-nav-row" align="center" justify="space-evenly">
        {items.map((item) => (
          <AsideItem key={item.item} asideItem={item} showLabel highlightSettingsGroup={false} />
        ))}
      </Flex>
    </nav>
  );
};

export default MobileNav;
