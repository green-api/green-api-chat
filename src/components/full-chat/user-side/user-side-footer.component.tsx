import { FC } from 'react';

import { Space } from 'antd';

import MessengerLink from 'components/shared/messenger-link.component';

const UserSideFooter: FC = () => {
  return (
    <Space className="user-side-footer" direction="vertical" align="center">
      <MessengerLink />
    </Space>
  );
};

export default UserSideFooter;
