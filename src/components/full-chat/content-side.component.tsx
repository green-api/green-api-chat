import { FC } from 'react';

import { Flex } from 'antd';
import { Outlet } from 'react-router-dom';

const ContentSide: FC = () => {
  return (
    <Flex className="content-side">
      <Outlet />
    </Flex>
  );
};

export default ContentSide;
