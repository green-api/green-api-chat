import { FC } from 'react';

import { Flex } from 'antd';

import ContactChatHeader from './contact-chat-header.component';
import ChatForm from 'components/mini-chat/contact-chat/chat-form.component';
import ChatView from 'components/shared/chat-view.component';

const ContactChat: FC = () => {
  return (
    <Flex vertical>
      <ContactChatHeader />
      <ChatView />
      <ChatForm />
    </Flex>
  );
};

export default ContactChat;
