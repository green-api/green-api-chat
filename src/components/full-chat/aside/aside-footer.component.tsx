import { FC } from 'react';

import { Flex } from 'antd';

import MessengerLink from 'components/shared/messenger-link.component';

const AsideFooter: FC = () => {
  return (
    <Flex className="aside-footer">
      <MessengerLink />
    </Flex>
  );
};

export default AsideFooter;
