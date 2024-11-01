import { FC } from 'react';

import { Flex } from 'antd';

import ContactChatFooter from './contact-chat-footer.component';
import ContactChatHeader from './contact-chat-header.component';
import ChatView from 'components/shared/chat-view.component';
import { useAppSelector, useMediaQuery } from 'hooks';
import { selectActiveChat, selectIsContactInfoOpen } from 'store/slices/chat.slice';
import { ActiveChat } from 'types';

const ContactChatMain: FC = () => {
  const isContactInfoOpen = useAppSelector(selectIsContactInfoOpen);
  const activeChat = useAppSelector(selectActiveChat) as ActiveChat;

  const matchMedia = useMediaQuery('(max-width: 1150px)');

  return (
    <Flex vertical className={`w-100 ${matchMedia && isContactInfoOpen ? 'display-none' : ''}`}>
      <div className="chat-bg" />
      <ContactChatHeader />
      <ChatView key={activeChat.chatId} />
      <ContactChatFooter />
    </Flex>
  );
};

export default ContactChatMain;
