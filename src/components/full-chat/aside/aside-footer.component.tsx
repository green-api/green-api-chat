import { FC } from 'react';

import { Space } from 'antd';

import MessengerLink from 'components/shared/messenger-link.component';
import SelectLanguage from 'components/UI/select-language.component';

const AsideFooter: FC = () => {
  return (
    <Space className="aside-footer" direction="vertical" align="center">
      <SelectLanguage />
      <MessengerLink />
    </Space>
  );
};

export default AsideFooter;
