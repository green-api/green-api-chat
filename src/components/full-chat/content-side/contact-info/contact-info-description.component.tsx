import { FC } from 'react';

import { Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import { useAppSelector } from 'hooks';
import { selectActiveChat } from 'store/slices/chat.slice';
import { ActiveChat, LanguageLiteral } from 'types';
import { formatDate, getFormattedMessage, isContactInfo } from 'utils';

const ContactInfoDescription: FC = () => {
  const activeChat = useAppSelector(selectActiveChat) as ActiveChat;

  const {
    i18n: { resolvedLanguage },
  } = useTranslation();

  if (!activeChat.contactInfo) {
    return null;
  }

  const description = isContactInfo(activeChat.contactInfo)
    ? activeChat.contactInfo.description
    : `Group created by ${activeChat.contactInfo.owner.replace(/\@.*$/, '')}, ${formatDate(+activeChat.contactInfo.creation * 1000, resolvedLanguage as LanguageLiteral, 'long')}`;

  if (!description) {
    return null;
  }

  const formattedDescription = getFormattedMessage(description);

  return (
    <div className="contact-info-description w-100 p-10">
      <Typography.Paragraph>{formattedDescription}</Typography.Paragraph>
    </div>
  );
};

export default ContactInfoDescription;
