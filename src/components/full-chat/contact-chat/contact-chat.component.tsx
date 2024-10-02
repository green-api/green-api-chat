import { FC } from 'react';

import { Flex } from 'antd';

import ContactChatHeader from './contact-chat-header.component';
import ChatForm from 'components/forms/chat-form.component';
import ChatView from 'components/shared/chat-view.component';
import SelectSendingMode from 'components/UI/select-sending-mode.component';

const ContactChat: FC = () => {
  return (
    <Flex vertical style={{ width: '100%' }}>
      <div className="chat-bg" />
      <ContactChatHeader />
      <ChatView key={Date.now()} />
      <Flex align="center" className="chat-form-container">
        <SelectSendingMode />
        <div style={{ flex: '1' }}>
          <ChatForm />
        </div>
      </Flex>
    </Flex>
  );
};

export default ContactChat;
