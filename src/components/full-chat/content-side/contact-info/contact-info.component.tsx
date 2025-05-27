import { FC } from 'react';

import { Flex } from 'antd';

import ContactInfoDescription from './contact-info-description.component';
import ContactInfoHeader from './contact-info-header.component';
import GroupContactList from 'components/shared/group-contact-list/group-contact-list.component';
import { useAppSelector } from 'hooks';
import { selectActiveChat, selectIsContactInfoOpen } from 'store/slices/chat.slice';

const ContactInfo: FC = () => {
  const activeChat = useAppSelector(selectActiveChat);
  const isContactInfoOpen = useAppSelector(selectIsContactInfoOpen);

  if (!isContactInfoOpen || !activeChat) {
    return null;
  }

  return (
    <div
      className={`contact-info-wrapper chat-border relative ${isContactInfoOpen ? 'active' : ''}`}
    >
      <Flex
        vertical
        gap={8}
        className={`contact-info w-100 h-100 ${isContactInfoOpen ? 'active' : ''}`}
      >
        <ContactInfoHeader />
        <ContactInfoDescription />
        <GroupContactList />
      </Flex>
    </div>
  );
};

export default ContactInfo;
