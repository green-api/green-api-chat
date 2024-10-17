import { FC } from 'react';

import { CloseOutlined } from '@ant-design/icons';
import { Divider, Flex, Image, Space, Typography } from 'antd';
import { Header } from 'antd/es/layout/layout';

import { useActions, useAppSelector } from 'hooks';
import { selectActiveChat } from 'store/slices/chat.slice';
import { ActiveChat } from 'types';
import { isContactInfo } from 'utils';

const ContactInfoHeader: FC = () => {
  const activeChat = useAppSelector(selectActiveChat) as ActiveChat;

  const { setContactInfoOpen } = useActions();

  const info = activeChat.chatId.includes('@c.us') ? 'Contact info' : 'Group info';

  const getHeaderBody = () => {
    if (!activeChat.contactInfo) {
      const contactName = activeChat.chatId?.replace(/\@.*$/, '');

      const contactCredentials = activeChat.chatId.includes('@c.us')
        ? activeChat.chatId?.replace(/\@.*$/, '')
        : 'Group';

      return (
        <Flex vertical gap={2} justify="center" align="center" className="w-100">
          <Typography.Title level={2} style={{ marginBottom: 'unset' }}>
            {contactName}
          </Typography.Title>
          {contactCredentials !== contactName && (
            <Typography.Text style={{ fontSize: 18 }}>{contactCredentials}</Typography.Text>
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
      : `Group  ·  ${activeChat.contactInfo.participants.length} members`;

    const category = isContactInfo(activeChat.contactInfo) && activeChat.contactInfo.category;

    const isBusiness = isContactInfo(activeChat.contactInfo) && activeChat.contactInfo.isBusiness;

    return (
      <Flex vertical gap={2} justify="center" align="center" className="w-100">
        <Typography.Title level={2} style={{ marginBottom: 'unset' }}>
          {contactName}
        </Typography.Title>
        {contactCredentials !== contactName && (
          <Typography.Text style={{ fontSize: 18 }}>{contactCredentials}</Typography.Text>
        )}
        {category && <Typography.Text>{category}</Typography.Text>}
        {isBusiness && (
          <>
            <Divider style={{ borderBlockStart: '1px solid rgba(0, 0, 0, 0.1)' }} />
            <Typography.Text style={{ alignSelf: 'flex-start' }}>
              This is business account.
            </Typography.Text>
          </>
        )}
      </Flex>
    );
  };

  return (
    <Flex vertical gap={20} className="contact-info-header">
      <Header className="p-10">
        <Space>
          <a>
            <CloseOutlined style={{ width: 13 }} onClick={() => setContactInfoOpen(false)} />
          </a>
          <span>{info}</span>
        </Space>
      </Header>
      <Flex vertical justify="center" align="center" gap={10} className="p-10 text-center">
        <div style={{ borderRadius: '50%', width: 200, height: 200, overflow: 'hidden' }}>
          <Image width={200} height={200} src={activeChat.avatar} />
        </div>
        {getHeaderBody()}
      </Flex>
    </Flex>
  );
};

export default ContactInfoHeader;
