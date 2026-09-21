import { FC } from 'react';

import { CloseOutlined } from '@ant-design/icons';
import { Divider, Flex, Image, Typography } from 'antd';
import { Header } from 'antd/es/layout/layout';
import { useTranslation } from 'react-i18next';

import waChatIcon from 'assets/wa-chat.svg';
import EditGroupName from 'components/shared/chat-header/edit-group-name.component';
import GroupAvatarUpload from 'components/shared/chat-header/group-avatar-upload.component';
import LeaveGroupButton from 'components/shared/chat-header/leave-group.component';
import { useActions, useAppSelector } from 'hooks';
import { useIsGroupAdmin } from 'hooks/use-is-group-admin.hook';
import { useIsMaxInstance } from 'hooks/use-is-max-instance';
import { useIsTelegramInstance } from 'hooks/use-is-telegram-instance';
import { useGetGroupDataQuery } from 'services/green-api/endpoints';
import { selectActiveChat } from 'store/slices/chat.slice';
import { selectInstance } from 'store/slices/instances.slice';
import { ActiveChat, LanguageLiteral } from 'types';
import {
  fillJsxString,
  formatPhoneNumber,
  isChannelGroupData,
  isContactInfo,
  isWhatsAppOfficialChat,
  normalizeAvatarSrc,
  numWord,
} from 'utils';

const ContactInfoHeader: FC = () => {
  const { setContactInfoOpen } = useActions();
  const {
    t,
    i18n: { resolvedLanguage },
  } = useTranslation();

  const activeChat = useAppSelector(selectActiveChat) as ActiveChat;
  const instanceCredentials = useAppSelector(selectInstance);
  const isMax = useIsMaxInstance();
  const isTelegram = useIsTelegramInstance();
  const isGroup = activeChat.chatId?.includes('@g.us') || activeChat.chatId?.startsWith('-');

  const isAdmin = useIsGroupAdmin(activeChat);
  const isOfficial = isWhatsAppOfficialChat(activeChat.chatId);

  const { data: groupData } = useGetGroupDataQuery(
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

  const isChannel = isChannelGroupData(isTelegram ? groupData : activeChat.contactInfo);

  const info = isChannel ? t('CHANNEL_INFO') : isGroup ? t('GROUP_INFO') : t('CONTACT_INFO');

  const getParticipantsCount = (data: unknown) => {
    if (data && typeof data === 'object' && 'participants' in data) {
      const participants = (data as { participants: unknown }).participants;
      return Array.isArray(participants) ? participants.length : 0;
    }
    return 0;
  };

  const getChannelCredentials = (size: number | undefined) => {
    const subscribersCount = size ?? 0;

    return fillJsxString(t('CHANNEL_COUNT_SUBSCRIBERS'), [
      subscribersCount.toString(),
      numWord(
        subscribersCount,
        {
          ru: ['подписчик', 'подписчика', 'подписчиков'],
          en: ['subscriber', 'subscribers', 'subscribers'],
          he: ['מנוי', 'מנויים', 'מנויים'],
          tr: ['abone', 'abone', 'abone'],
        },
        resolvedLanguage as LanguageLiteral
      ),
    ]);
  };

  const getHeaderBody = () => {
    if (isTelegram && isGroup) {
      if (!groupData || typeof groupData === 'string') {
        return (
          <Flex vertical gap={2} justify="center" align="center" className="w-100">
            <Typography.Text style={{ fontSize: 15 }}>
              id: {activeChat.chatId?.replace(/\@.*$/, '')}
            </Typography.Text>
          </Flex>
        );
      }

      const groupSubject = 'subject' in groupData ? groupData.subject : activeChat.senderName;
      const participantsCount = getParticipantsCount(groupData);
      const groupCredentials = isChannel
        ? getChannelCredentials(groupData.size)
        : fillJsxString(t('GROUP_COUNT_MEMBERS'), [
            participantsCount.toString(),
            numWord(
              participantsCount,
              {
                ru: ['участник', 'участника', 'участников'],
                en: ['member', 'members', 'members'],
                he: ['חברים', 'חברים', 'חָבֵר'],
                tr: ['üye', 'üye', 'üye'],
              },
              resolvedLanguage as LanguageLiteral
            ),
          ]);

      return (
        <Flex vertical gap={2} justify="center" align="center" className="w-100">
          <Flex gap={6} align="center">
            {isGroup && !isChannel && <EditGroupName />}
          </Flex>
          <Typography.Text style={{ fontSize: 15 }}>
            id: {activeChat.chatId?.replace(/\@.*$/, '')}
          </Typography.Text>
          <Typography.Title
            level={2}
            style={{ marginBottom: 'unset' }}
            className="contact-info-name"
          >
            {groupSubject}
          </Typography.Title>
          <Typography.Text className="contact-info-credentials">{groupCredentials}</Typography.Text>
        </Flex>
      );
    }

    if (!activeChat.contactInfo || typeof activeChat.contactInfo === 'string') {
      const contactName = activeChat.chatId?.replace(/\@.*$/, '');

      const contactCredentials = activeChat.chatId?.includes('@c.us')
        ? activeChat.chatId?.replace(/\@.*$/, '')
        : 'Group';

      return (
        <Flex vertical gap={2} justify="center" align="center" className="w-100">
          <Typography.Title
            level={2}
            style={{ marginBottom: 'unset' }}
            className="contact-info-name"
          >
            {contactName}
          </Typography.Title>
          {!isOfficial && contactCredentials !== contactName && (
            <Typography.Text className="contact-info-credentials">
              {contactCredentials}
            </Typography.Text>
          )}
        </Flex>
      );
    }

    let isContact = false;
    let contactName: string | undefined;
    let contactCredentials: JSX.Element | string | undefined;
    let category: string | null | undefined;
    let isBusiness = false;
    let phoneNumber: number | undefined;

    if (isContactInfo(activeChat.contactInfo, isMax)) {
      isContact = true;
      contactName =
        activeChat.contactInfo.contactName || activeChat.contactInfo.name || activeChat.senderName;
      contactCredentials = activeChat.chatId?.replace(/\@.*$/, '');
      category = activeChat.contactInfo.category;
      isBusiness = activeChat.contactInfo.isBusiness;

      if (isMax || isTelegram) {
        phoneNumber = activeChat.contactInfo.phoneNumber;
      }
    } else {
      contactName = activeChat.contactInfo.subject || activeChat.senderName;
      contactCredentials = isChannel
        ? getChannelCredentials(activeChat.contactInfo.size)
        : fillJsxString(t('GROUP_COUNT_MEMBERS'), [
            activeChat.contactInfo.participants.length.toString(),
            numWord(
              activeChat.contactInfo.participants.length,
              {
                ru: ['участник', 'участника', 'участников'],
                en: ['member', 'members', 'members'],
                he: ['חברים', 'חברים', 'חָבֵר'],
                tr: ['üye', 'üye', 'üye'],
              },
              resolvedLanguage as LanguageLiteral
            ),
          ]);
    }

    return (
      <Flex vertical gap={2} justify="center" align="center" className="w-100">
        <Flex gap={6} align="center">
          {isGroup && !isChannel && <EditGroupName />}
        </Flex>
        {!isContact && (
          <Typography.Text style={{ fontSize: 15 }}>
            id: {activeChat.chatId?.replace(/\@.*$/, '')}
          </Typography.Text>
        )}
        {contactName && (
          <Typography.Title
            level={2}
            style={{ marginBottom: 'unset' }}
            className="contact-info-name"
          >
            {contactName}
          </Typography.Title>
        )}
        {Boolean(contactCredentials) && contactCredentials !== contactName && (
          <Typography.Text className="contact-info-credentials">
            {isContact ? `id: ${contactCredentials}` : contactCredentials}
          </Typography.Text>
        )}
        {Boolean(phoneNumber) && (
          <Typography.Text className="contact-info-credentials">
            {formatPhoneNumber(phoneNumber!)}
          </Typography.Text>
        )}
        {category && <Typography.Text>{category}</Typography.Text>}
        {isBusiness && (
          <>
            <Divider style={{ borderBlockStart: '1px solid rgba(0, 0, 0, 0.1)' }} />
            <Typography.Text style={{ alignSelf: 'flex-start' }}>
              {t('BUSINESS_ACCOUNT_DESC')}
            </Typography.Text>
          </>
        )}
      </Flex>
    );
  };

  return (
    <Flex vertical className="contact-info-header">
      <Header className="p-10">
        <Flex align="center" justify="space-between" style={{ flexGrow: 1 }}>
          <Flex align="center" gap={10}>
            <a>
              <CloseOutlined style={{ width: 13 }} onClick={() => setContactInfoOpen(false)} />
            </a>
            <div style={{ textWrap: 'nowrap' }}>{info}</div>
          </Flex>
          {isGroup && !isChannel && <LeaveGroupButton activeChat={activeChat} />}
        </Flex>
      </Header>
      <Flex vertical justify="center" align="center" gap={10} className="p-10 text-center">
        <Flex vertical align="center" gap={8}>
          <div style={{ borderRadius: '50%', overflow: 'hidden' }}>
            <Image
              preview={false}
              className="contact-info-avatar"
              src={normalizeAvatarSrc(isOfficial ? waChatIcon : activeChat.avatar)}
            />
          </div>
          {isGroup && !isChannel && isAdmin && <GroupAvatarUpload activeChat={activeChat} />}
        </Flex>

        {getHeaderBody()}
      </Flex>
    </Flex>
  );
};

export default ContactInfoHeader;
