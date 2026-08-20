import { FC } from 'react';

import CantSendInGroupAlert from 'components/alerts/cant-send-in-group-alert.component';
import ChatForm from 'components/forms/chat-form.component';
import ChatView from 'components/shared/chat-view.component';
import { useAppSelector } from 'hooks';
import { selectActiveChat } from 'store/slices/chat.slice';
import { ActiveChat } from 'types';
import { isChannelChatType } from 'utils';

const ContactChat: FC = () => {
  const activeChat = useAppSelector(selectActiveChat) as ActiveChat;

  const isChannel = isChannelChatType(activeChat.chatType);
  const isForbidden = typeof activeChat.contactInfo === 'string';

  return (
    <div className="chat-form-wrapper relative">
      <div className="chat-bg" />
      <ChatView />
      {!isChannel && (isForbidden ? <CantSendInGroupAlert /> : <ChatForm />)}
    </div>
  );
};

export default ContactChat;
