import { FC } from 'react';

import { Flex } from 'antd';

import AsideItem from './aside-item.component';
import { asideBottomIconItems, asideTopIconItems } from 'configs';

const Aside: FC = () => {
  return (
    <aside className="aside">
      <Flex justify="center" style={{ flexGrow: 1 }} gap={8}>
        {asideTopIconItems.map((item) => (
          <AsideItem key={item.item} asideItem={item} />
        ))}
      </Flex>
      <Flex justify="center" align="center" vertical gap={8}>
        {asideBottomIconItems.map((item) => (
          <AsideItem key={item.item} asideItem={item} />
        ))}
      </Flex>
    </aside>
  );
};

export default Aside;
