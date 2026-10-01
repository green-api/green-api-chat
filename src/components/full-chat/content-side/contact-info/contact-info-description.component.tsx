import { FC } from 'react';

import { PhoneOutlined } from '@ant-design/icons';
import { Button, Flex, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import { useAppSelector } from 'hooks';
import { useIsMaxInstance } from 'hooks/use-is-max-instance';
import { useIsTelegramInstance } from 'hooks/use-is-telegram-instance';
import { useGetGroupDataQuery } from 'services/green-api/endpoints';
import { selectActiveChat, selectType } from 'store/slices/chat.slice';
import {
  selectEnableCalls,
  selectInstance,
  selectInstanceTariff,
} from 'store/slices/instances.slice';
import { ActiveChat, LanguageLiteral } from 'types';
import {
  fillJsxString,
  formatDate,
  getFormattedMessage,
  getPhoneNumberFromChatId,
  isChannelGroupData,
  isContactInfo,
} from 'utils';

const ContactInfoDescription: FC = () => {
  const activeChat = useAppSelector(selectActiveChat) as ActiveChat;
  const instanceCredentials = useAppSelector(selectInstance);
  const enableCalls = useAppSelector(selectEnableCalls);
  const tariff = useAppSelector(selectInstanceTariff);
  const type = useAppSelector(selectType);
  const isMax = useIsMaxInstance();
  const isTelegram = useIsTelegramInstance();
  const enableMarkdownLinks = isMax || isTelegram;
  const isGroup = activeChat.chatId?.includes('@g.us') || activeChat.chatId?.startsWith('-');
  const showCallButton =
    !isMax && !isTelegram && !isGroup && (type === 'console-page' || type === 'instance-view-page');

  const {
    t,
    i18n: { resolvedLanguage },
  } = useTranslation();

  const handleCallClick = () => {
    if (enableCalls) {
      window.parent.postMessage(
        {
          event: 'openCalls',
          pendingCall: {
            chatId: activeChat.chatId,
            phone: getPhoneNumberFromChatId(activeChat.chatId),
            name: activeChat.senderName,
            avatar: activeChat.avatar,
          },
        },
        '*'
      );
      return;
    }

    window.parent.postMessage({ event: 'callsUnavailable', tariff }, '*');
  };

  const callButtonBlock = showCallButton ? (
    <div className="contact-info-description w-100 p-10">
      <Button
        className="call-button"
        icon={<PhoneOutlined />}
        onClick={handleCallClick}
        title={t('CALL_BUTTON_TITLE')}
      />
    </div>
  ) : null;

  const { data: telegramGroupData } = useGetGroupDataQuery(
    {
      ...instanceCredentials,
      chatId: activeChat.chatId,
    },
    {
      skip:
        !isTelegram ||
        !isGroup ||
        !activeChat?.chatId ||
        !instanceCredentials?.idInstance ||
        !instanceCredentials?.apiTokenInstance,
    }
  );

  const getBooleanLabel = (value: boolean) => (value ? t('YES') : t('NO'));

  if (isTelegram && isGroup) {
    if (!telegramGroupData || typeof telegramGroupData === 'string') {
      return null;
    }

    const isChannel = isChannelGroupData(telegramGroupData);

    const description = fillJsxString(t('GROUP_CREATED_BY'), [
      telegramGroupData.owner?.replace(/\@.*$/, ''),
      formatDate(+telegramGroupData.creation * 1000, resolvedLanguage as LanguageLiteral, 'long'),
    ]);

    const groupInviteLink = telegramGroupData.groupInviteLink;
    const formattedLink = groupInviteLink
      ? getFormattedMessage(groupInviteLink, { enableMarkdownLinks })
      : null;
    const groupDescription = telegramGroupData.description;
    const allowParticipantsSendInviteLink = !isChannel
      ? telegramGroupData.allowParticipantsSendInviteLink
      : null;
    const allowParticipantsSendMessageHistory = !isChannel
      ? telegramGroupData.allowParticipantsSendMessageHistory
      : null;
    const hasGroupSettings =
      groupDescription ||
      typeof allowParticipantsSendInviteLink === 'boolean' ||
      typeof allowParticipantsSendMessageHistory === 'boolean';
    const shouldRenderDescriptionBlock = Boolean(description);

    if (!shouldRenderDescriptionBlock && !hasGroupSettings && !formattedLink) {
      return null;
    }

    return (
      <>
        {shouldRenderDescriptionBlock && (
          <div className="contact-info-description w-100 p-10">
            <Typography.Paragraph style={{ marginBottom: 'initial' }}>
              {description}
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
  }

  if (!activeChat.contactInfo || typeof activeChat.contactInfo === 'string') {
    return callButtonBlock;
  }

  const isChannel = isChannelGroupData(activeChat.contactInfo);

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
  const allowParticipantsSendInviteLink =
    !isContactInfo(activeChat.contactInfo) && !isChannel
      ? activeChat.contactInfo.allowParticipantsSendInviteLink
      : null;
  const allowParticipantsSendMessageHistory =
    !isContactInfo(activeChat.contactInfo) && !isChannel
      ? activeChat.contactInfo.allowParticipantsSendMessageHistory
      : null;
  const hasGroupSettings =
    groupDescription ||
    typeof allowParticipantsSendInviteLink === 'boolean' ||
    typeof allowParticipantsSendMessageHistory === 'boolean';
  const shouldRenderDescriptionBlock = Boolean(description);

  if (!shouldRenderDescriptionBlock && !hasGroupSettings && !formattedLink) {
    return callButtonBlock;
  }

  return (
    <>
      {callButtonBlock}
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
