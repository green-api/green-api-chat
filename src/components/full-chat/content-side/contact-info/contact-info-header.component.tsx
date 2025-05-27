import { FC, useState } from 'react';

import { CloseOutlined, EditFilled, CheckOutlined, UploadOutlined } from '@ant-design/icons';
import {
  Button,
  Divider,
  Flex,
  Image,
  Input,
  message,
  Popconfirm,
  Space,
  Typography,
  Upload,
} from 'antd';
import { Header } from 'antd/es/layout/layout';
import { RcFile } from 'antd/es/upload';
import { useTranslation } from 'react-i18next';

import { useActions, useAppSelector } from 'hooks';
import {
  useLeaveGroupMutation,
  useSetGroupPictureMutation,
  useUpdateGroupNameMutation,
} from 'services/green-api/endpoints';
import { selectActiveChat } from 'store/slices/chat.slice';
import { selectInstance } from 'store/slices/instances.slice';
import { ActiveChat, LanguageLiteral } from 'types';
import { fillJsxString, isContactInfo, numWord } from 'utils';

const ContactInfoHeader: FC = () => {
  const activeChat = useAppSelector(selectActiveChat) as ActiveChat;
  const [updateGroupName] = useUpdateGroupNameMutation();
  const [setGroupPicture, { isLoading: isUpdatingPicture }] = useSetGroupPictureMutation();
  const [leaveGroup] = useLeaveGroupMutation();
  const [isEditing, setIsEditing] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  const isGroup = activeChat.chatId.includes('@g.us');

  const {
    t,
    i18n: { resolvedLanguage },
  } = useTranslation();

  const { setContactInfoOpen, setActiveChat } = useActions();
  const instanceCredentials = useAppSelector(selectInstance);

  const info = activeChat.chatId.includes('@c.us') ? t('CONTACT_INFO') : t('GROUP_INFO');

  const handleEditClick = () => {
    setNewGroupName(
      activeChat.contactInfo !== 'Error: forbidden'
        ? activeChat.contactInfo &&
          !isContactInfo(activeChat.contactInfo) &&
          'subject' in activeChat.contactInfo
          ? activeChat.contactInfo.subject
          : ''
        : ''
    );
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    try {
      await updateGroupName({
        groupId: activeChat.chatId,
        groupName: newGroupName,
        ...instanceCredentials,
      }).unwrap();
      setActiveChat({
        ...activeChat,
        senderName: newGroupName,
        contactInfo:
          typeof activeChat.contactInfo === 'object' &&
          activeChat.contactInfo !== null &&
          'subject' in activeChat.contactInfo
            ? {
                ...activeChat.contactInfo,
                subject: newGroupName,
              }
            : activeChat.contactInfo,
      });
      setIsEditing(false);
    } catch (error) {
      message.error(t('ERROR_UPDATING_GROUP_NAME'));
    }
  };

  const handleAvatarUpload = async (file: RcFile) => {
    if (!file || !file.type.includes('image')) {
      message.error(t('INVALID_IMAGE_FILE'));
      return;
    }

    const formData = new FormData();
    formData.append('groupId', activeChat.chatId);
    formData.append('file', file);

    try {
      await setGroupPicture({
        idInstance: instanceCredentials.idInstance.toString(),
        apiTokenInstance: instanceCredentials.apiTokenInstance,
        apiUrl: instanceCredentials.apiUrl,
        body: formData,
      }).unwrap();

      message.success(t('AVATAR_UPDATED'));

      setActiveChat({
        ...activeChat,
        avatar: URL.createObjectURL(file),
      });
    } catch {
      message.error(t('ERROR_UPDATING_AVATAR'));
    }
  };

  const handleLeaveGroupClick = async () => {
    try {
      await leaveGroup({
        groupId: activeChat.chatId,
        ...instanceCredentials,
      }).unwrap();
      message.success(t('LEFT_GROUP_SUCCESS'));
      setContactInfoOpen(false);
    } catch (error) {
      message.error(t('ERROR_LEAVING_GROUP'));
    }
  };

  const getHeaderBody = () => {
    if (!activeChat.contactInfo || activeChat.contactInfo === 'Error: forbidden') {
      const contactName = activeChat.chatId?.replace(/\@.*$/, '');

      const contactCredentials = activeChat.chatId.includes('@c.us')
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
          {contactCredentials !== contactName && (
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
          {isEditing ? (
            <Space.Compact>
              <Input
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                style={{ width: 200 }}
              />
              <Button icon={<CheckOutlined />} onClick={handleSaveClick} type="primary" />
            </Space.Compact>
          ) : (
            <>
              <Typography.Title
                level={2}
                style={{ marginBottom: 'unset' }}
                className="contact-info-name"
              >
                {contactName}
              </Typography.Title>
              {isGroup && <Button icon={<EditFilled />} onClick={handleEditClick} type="text" />}
            </>
          )}
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
          {isGroup && (
            <Popconfirm
              title={t('CONFIRM_LEAVE_GROUP')}
              okText={t('YES')}
              cancelText={t('NO')}
              onConfirm={handleLeaveGroupClick}
            >
              <Button type="default" className="delete-button" danger variant="solid">
                {t('LEAVE_GROUP')}
              </Button>
            </Popconfirm>
          )}
        </Flex>
      </Header>
      <Flex vertical justify="center" align="center" gap={10} className="p-10 text-center">
        <Flex vertical align="center" gap={8}>
          <div style={{ borderRadius: '50%', overflow: 'hidden' }}>
            <Image preview={false} className="contact-info-avatar" src={activeChat.avatar} />
          </div>
          {isGroup && (
            <Upload
              showUploadList={false}
              beforeUpload={(file) => {
                handleAvatarUpload(file);
                return false;
              }}
              accept="image/jpeg,image/jpg"
            >
              <Button
                icon={<UploadOutlined />}
                size="small"
                loading={isUpdatingPicture}
                disabled={isUpdatingPicture}
              >
                {t('UPDATE_AVATAR')}
              </Button>
            </Upload>
          )}
        </Flex>

        {getHeaderBody()}
      </Flex>
    </Flex>
  );
};

export default ContactInfoHeader;
