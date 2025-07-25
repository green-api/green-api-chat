import { FC } from 'react';

import { Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import { useAppSelector } from 'hooks';
import { selectActiveChat } from 'store/slices/chat.slice';
import { ActiveChat, LanguageLiteral } from 'types';
import { fillJsxString, formatDate, getFormattedMessage, isContactInfo } from 'utils';

const ContactInfoDescription: FC = () => {
  const activeChat = useAppSelector(selectActiveChat) as ActiveChat;

  const {
    t,
    i18n: { resolvedLanguage },
  } = useTranslation();

  if (!activeChat.contactInfo || activeChat.contactInfo === 'Error: forbidden') {
    return null;
  }

  const description = isContactInfo(activeChat.contactInfo)
    ? activeChat.contactInfo.description
    : fillJsxString(t('GROUP_CREATED_BY'), [
        activeChat.contactInfo.owner.replace(/\@.*$/, ''),
        formatDate(
          +activeChat.contactInfo.creation * 1000,
          resolvedLanguage as LanguageLiteral,
          'long'
        ),
      ]);

  if (!description) {
    return null;
  }

  const formattedDescription = isContactInfo(activeChat.contactInfo)
    ? getFormattedMessage(description as string)
    : description;

  const groupInviteLink = !isContactInfo(activeChat.contactInfo)
    ? activeChat.contactInfo.groupInviteLink
    : null;

  const formattedLink = groupInviteLink ? getFormattedMessage(groupInviteLink) : null;

  return (
    <>
      <div className="contact-info-description w-100 p-10">
        <Typography.Paragraph style={{ marginBottom: 'initial' }}>
          {formattedDescription}
        </Typography.Paragraph>
      </div>
      {formattedLink && (
        <div className="contact-info-group-link p-10">
          <Typography.Paragraph style={{ marginBottom: 'initial' }} ellipsis={{ rows: 1 }}>
            {t('GROUP_INVITE_LINK')}: {formattedLink}
          </Typography.Paragraph>
        </div>
      )}
    </>
  );
};

export default ContactInfoDescription;
