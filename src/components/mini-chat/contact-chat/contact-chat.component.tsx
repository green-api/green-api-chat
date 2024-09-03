import { FC } from 'react';

import ChatForm from './chat-form.component';
import ChatView from 'components/shared/chat-view.component';

const ContactChat: FC = () => {
  return (
    <div className="chat-form-wrapper">
      <ChatView />
      <ChatForm />
    </div>
  );
};

export default ContactChat;
