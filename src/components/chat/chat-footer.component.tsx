import { FC } from 'react';

import NewChatForm from './new-chat-form.component';

const ChatFooter: FC = () => {
  return (
    <div className="chat-footer">
      <NewChatForm />
    </div>
  );
};

export default ChatFooter;
