import { FC } from 'react';

import { Flex } from 'antd';

import AsideItem from './aside-item.component';
import { asideBottomIconItems, asideTopIconItems } from 'configs';
import { useIsMaxInstance } from 'hooks/use-is-max-instance';

const Aside: FC = () => {
  const isMax = useIsMaxInstance();
  return (
    <aside className="aside">
      <Flex vertical style={{ flexGrow: 1 }} gap={12}>
        {asideTopIconItems.map((item) =>
          item.waOnly && isMax ? null : <AsideItem key={item.item} asideItem={item} />
        )}
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
