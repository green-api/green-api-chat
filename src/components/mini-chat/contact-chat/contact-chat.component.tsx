import { FC } from 'react';

import ChatView from 'components/shared/chat-view.component';
import ChatForm from 'components/forms/chat-form.component';

const ContactChat: FC = () => {
  return (
    <div className="chat-form-wrapper">
      <ChatView />
      <ChatForm />
    </div>
  );
};

export default ContactChat;
