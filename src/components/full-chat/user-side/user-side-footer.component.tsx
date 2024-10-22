import { FC } from 'react';

import { Space } from 'antd';

import MessengerLink from 'components/shared/messenger-link.component';
import SelectLanguage from 'components/UI/select/select-language.component';

const UserSideFooter: FC = () => {
  return (
    <Space className="user-side-footer" direction="vertical" align="center">
      <SelectLanguage />
      <MessengerLink />
    </Space>
  );
};

export default UserSideFooter;
