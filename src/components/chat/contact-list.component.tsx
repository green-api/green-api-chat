import { FC } from 'react';

import { Flex } from 'antd';

import ContactListItem from './contact-list-item.component';
import { GetChatHistoryResponse } from 'types';

interface ContactListProps {
  list: GetChatHistoryResponse;
}

const ContactList: FC<ContactListProps> = ({ list }) => {
  return (
    <Flex vertical className="contact-list">
      {list.map((message) => (
        <ContactListItem key={message.chatId} lastMessage={message} />
      ))}
    </Flex>
  );
};

export default ContactList;
