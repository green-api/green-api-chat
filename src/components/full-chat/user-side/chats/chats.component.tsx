import { FC } from 'react';

import { Flex } from 'antd';

import ChatsHeader from './chats-header.component';
import ContactList from 'components/shared/contact-list.component';
import SelectInstance from 'components/UI/select-instance.component';

const Chats: FC = () => {
  return (
    <Flex className="chats" vertical>
      <ChatsHeader />
      <SelectInstance />
      <ContactList />
    </Flex>
  );
};

export default Chats;
