import { FC } from 'react';

import CantSendInGroupAlert from 'components/alerts/cant-send-in-group-alert.component';
import ChatForm from 'components/forms/chat-form.component';
import ChatView from 'components/shared/chat-view.component';
import { useAppSelector } from 'hooks';
import { selectActiveChat } from 'store/slices/chat.slice';
import { ActiveChat } from 'types';

const ContactChat: FC = () => {
  const activeChat = useAppSelector(selectActiveChat) as ActiveChat;

  return (
    <div className="chat-form-wrapper">
      <ChatView />
      {activeChat.contactInfo === 'Error: forbidden' ? <CantSendInGroupAlert /> : <ChatForm />}
    </div>
  );
};

export default ContactChat;
