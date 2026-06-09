import { FC } from 'react';

import { Flex, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import { useAppSelector } from 'hooks';
import { useIsMaxInstance } from 'hooks/use-is-max-instance';
import { useIsTelegramInstance } from 'hooks/use-is-telegram-instance';
import { selectActiveChat } from 'store/slices/chat.slice';
import { ActiveChat, LanguageLiteral } from 'types';
import { fillJsxString, formatDate, getFormattedMessage, isContactInfo } from 'utils';

const ContactInfoDescription: FC = () => {
  const activeChat = useAppSelector(selectActiveChat) as ActiveChat;
  const isMax = useIsMaxInstance();
  const isTelegram = useIsTelegramInstance();
  const enableMarkdownLinks = isMax || isTelegram;

  const {
    t,
    i18n: { resolvedLanguage },
  } = useTranslation();

  if (!activeChat.contactInfo || typeof activeChat.contactInfo === 'string') {
    return null;
  }

  const description = isContactInfo(activeChat.contactInfo, isMax)
    ? activeChat.contactInfo.description
    : fillJsxString(t('GROUP_CREATED_BY'), [
        activeChat.contactInfo.owner.replace(/\@.*$/, ''),
        formatDate(
          +activeChat.contactInfo.creation * 1000,
          resolvedLanguage as LanguageLiteral,
          'long'
        ),
      ]);

  const formattedDescription = isContactInfo(activeChat.contactInfo, isMax)
    ? getFormattedMessage(description as string, { enableMarkdownLinks })
    : description;

  const groupInviteLink = !isContactInfo(activeChat.contactInfo, isMax)
    ? activeChat.contactInfo.groupInviteLink
    : null;

  const formattedLink = groupInviteLink
    ? getFormattedMessage(groupInviteLink, { enableMarkdownLinks })
    : null;
  const groupDescription = !isContactInfo(activeChat.contactInfo)
    ? activeChat.contactInfo.description
    : null;
  const allowParticipantsSendInviteLink = !isContactInfo(activeChat.contactInfo)
    ? activeChat.contactInfo.allowParticipantsSendInviteLink
    : null;
  const allowParticipantsSendMessageHistory = !isContactInfo(activeChat.contactInfo)
    ? activeChat.contactInfo.allowParticipantsSendMessageHistory
    : null;
  const hasGroupSettings =
    groupDescription ||
    typeof allowParticipantsSendInviteLink === 'boolean' ||
    typeof allowParticipantsSendMessageHistory === 'boolean';
  const getBooleanLabel = (value: boolean) => (value ? t('YES') : t('NO'));
  const shouldRenderDescriptionBlock = Boolean(description);

  if (!shouldRenderDescriptionBlock && !hasGroupSettings && !formattedLink) {
    return null;
  }

  return (
    <>
      {shouldRenderDescriptionBlock && (
        <div className="contact-info-description w-100 p-10">
          <Typography.Paragraph style={{ marginBottom: 'initial' }}>
            {formattedDescription}
          </Typography.Paragraph>
        </div>
      )}
      {hasGroupSettings && (
        <div className="contact-info-description w-100 p-10">
          <Flex vertical gap={6}>
            {groupDescription && (
              <Typography.Paragraph style={{ marginBottom: 'initial' }}>
                <strong>{t('DESCRIPTION')}:</strong>{' '}
                {getFormattedMessage(groupDescription, { enableMarkdownLinks })}
              </Typography.Paragraph>
            )}
            {typeof allowParticipantsSendInviteLink === 'boolean' && (
              <Typography.Paragraph style={{ marginBottom: 'initial' }}>
                <strong>{t('GROUP_ALLOW_PARTICIPANTS_SEND_INVITE_LINK')}:</strong>{' '}
                {getBooleanLabel(allowParticipantsSendInviteLink)}
              </Typography.Paragraph>
            )}
            {typeof allowParticipantsSendMessageHistory === 'boolean' && (
              <Typography.Paragraph style={{ marginBottom: 'initial' }}>
                <strong>{t('GROUP_ALLOW_PARTICIPANTS_SEND_MESSAGE_HISTORY')}:</strong>{' '}
                {getBooleanLabel(allowParticipantsSendMessageHistory)}
              </Typography.Paragraph>
            )}
          </Flex>
        </div>
      )}
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
