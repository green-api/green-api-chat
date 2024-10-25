import { FC } from 'react';

import { Flex } from 'antd';

import ContactChatMain from './contact-chat-main.component';
import ContactInfo from '../contact-info/contact-info.component';

const ContactChat: FC = () => {
  return (
    <Flex className="w-100">
      <ContactChatMain />
      <ContactInfo />
    </Flex>
  );
};

export default ContactChat;
