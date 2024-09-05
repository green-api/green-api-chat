import { FC } from 'react';

import { Flex, Space } from 'antd';

import ContactChatHeader from './contact-chat-header.component';
import ChatForm from 'components/forms/chat-form.component';
import ChatView from 'components/shared/chat-view.component';
import SelectSendingMode from 'components/UI/select-sending-mode.component';

const ContactChat: FC = () => {
  return (
    <Flex vertical>
      <ContactChatHeader />
      <ChatView />
      <Flex align="center">
        <SelectSendingMode />
        <div style={{ flex: '1' }}>
          <ChatForm />
        </div>
      </Flex>
    </Flex>
  );
};

export default ContactChat;
