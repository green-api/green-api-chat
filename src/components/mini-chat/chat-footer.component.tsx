import { FC } from 'react';

import NewChatForm from 'components/forms/new-chat-form.component';

const ChatFooter: FC = () => {
  return (
    <div className="chat-footer bg-color-second">
      <NewChatForm />
    </div>
  );
};

export default ChatFooter;
