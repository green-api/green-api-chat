import { FC, useEffect } from 'react';

import { Flex } from 'antd';

import ContactInfoHeader from './contact-info-header.component';
import { useActions, useAppSelector } from 'hooks';
import { selectActiveChat, selectIsContactInfoOpen } from 'store/slices/chat.slice';
import { ActiveChat } from 'types';

const ContactInfo: FC = () => {
  const activeChat = useAppSelector(selectActiveChat) as ActiveChat;
  const isContactInfoOpen = useAppSelector(selectIsContactInfoOpen);

  console.log(activeChat);

  const { setContactInfoOpen } = useActions();

  const getContactInfoContent = () => {
    if (!isContactInfoOpen) {
      return null;
    }

    return (
      <Flex
        vertical
        gap={8}
        className={`contact-info w-100 h-100 ${isContactInfoOpen ? 'active' : ''}`}
      >
        <ContactInfoHeader />
      </Flex>
    );
  };

  useEffect(() => {
    setContactInfoOpen(false);
  }, [activeChat]);

  return (
    <div
      className={`contact-info-wrapper chat-border relative ${isContactInfoOpen ? 'active' : ''}`}
    >
      {getContactInfoContent()}
    </div>
  );
};

export default ContactInfo;
