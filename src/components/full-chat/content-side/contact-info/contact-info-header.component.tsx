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
import { selectActiveChat } from 'store/slices/chat.slice';
import { ActiveChat, LanguageLiteral } from 'types';
import { fillJsxString, isContactInfo, isWhatsAppOfficialChat, numWord } from 'utils';

const ContactInfoHeader: FC = () => {
  const { setContactInfoOpen } = useActions();
  const {
    t,
    i18n: { resolvedLanguage },
  } = useTranslation();

  const activeChat = useAppSelector(selectActiveChat) as ActiveChat;
  const isGroup = activeChat.chatId?.includes('@g.us');
  const info = activeChat.chatId?.includes('@c.us') ? t('CONTACT_INFO') : t('GROUP_INFO');

  const isAdmin = useIsGroupAdmin(activeChat);
  const isOfficial = isWhatsAppOfficialChat(activeChat.chatId);

  const getHeaderBody = () => {
    if (!activeChat.contactInfo || activeChat.contactInfo === 'Error: forbidden') {
      const contactName = isOfficial ? 'WhatsApp' : activeChat.chatId?.replace(/\@.*$/, '');

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

    const contactName =
      (isContactInfo(activeChat.contactInfo)
        ? activeChat.contactInfo.contactName || activeChat.contactInfo.name
        : activeChat.contactInfo.subject) || activeChat.senderName;

    const contactCredentials = isContactInfo(activeChat.contactInfo)
      ? activeChat.chatId?.replace(/\@.*$/, '')
      : fillJsxString(t('GROUP_COUNT_MEMBERS'), [
          activeChat.contactInfo.participants.length.toString(),
          numWord(
            activeChat.contactInfo.participants.length,
            {
              ru: ['участник', 'участника', 'участников'],
              en: ['member', 'members', 'members'],
              he: ['חברים', 'חברים', 'חָבֵר'],
            },
            resolvedLanguage as LanguageLiteral
          ),
        ]);

    const category = isContactInfo(activeChat.contactInfo) && activeChat.contactInfo.category;
    const isBusiness = isContactInfo(activeChat.contactInfo) && activeChat.contactInfo.isBusiness;

    return (
      <Flex vertical gap={2} justify="center" align="center" className="w-100">
        <Flex gap={6} align="center">
          {isGroup && <EditGroupName />}
        </Flex>
        {!isContactInfo(activeChat.contactInfo) && (
          <Typography.Text style={{ fontSize: 15 }}>
            id: {activeChat.chatId?.replace(/\@.*$/, '')}
          </Typography.Text>
        )}
        {contactCredentials !== contactName && (
          <Typography.Text className="contact-info-credentials">
            {contactCredentials}
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
          {isGroup && <LeaveGroupButton activeChat={activeChat} />}
        </Flex>
      </Header>
      <Flex vertical justify="center" align="center" gap={10} className="p-10 text-center">
        <Flex vertical align="center" gap={8}>
          <div style={{ borderRadius: '50%', overflow: 'hidden' }}>
            <Image
              preview={false}
              className="contact-info-avatar"
              src={isOfficial ? waChatIcon : activeChat.avatar}
            />
          </div>
          {isGroup && isAdmin && <GroupAvatarUpload activeChat={activeChat} />}
        </Flex>

        {getHeaderBody()}
      </Flex>
    </Flex>
  );
};

export default ContactInfoHeader;
