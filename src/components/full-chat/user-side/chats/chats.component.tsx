import { FC } from 'react';

import { Flex } from 'antd';

import ChatsHeader from './chats-header.component';
import InstanceInfo from './instance-info.component';
import ContactList from 'components/shared/contact-list.component';

const Chats: FC = () => {
  return (
    <Flex className="chats" vertical>
      <ChatsHeader />
      <InstanceInfo />
      <ContactList />
    </Flex>
  );
};

export default Chats;
