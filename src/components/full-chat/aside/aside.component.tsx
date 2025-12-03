import { FC } from 'react';

import { Flex } from 'antd';

import AsideItem from './aside-item.component';
import { asideBottomIconItems, asideTopIconItems } from 'configs';
import { useAppSelector } from 'hooks';
import { selectType } from 'store/slices/chat.slice';

const Aside: FC = () => {
  const type = useAppSelector(selectType);

  const items = asideTopIconItems(type);
  return (
    <aside className="aside">
      <Flex vertical style={{ flexGrow: 1 }} gap={12}>
        {items.map((item) => !!item && <AsideItem key={item.item} asideItem={item} />)}
      </Flex>
      <Flex justify="center" align="center" vertical gap={12}>
        {asideBottomIconItems.map((item) => (
          <AsideItem key={item.item} asideItem={item} />
        ))}
      </Flex>
    </aside>
  );
};

export default Aside;
