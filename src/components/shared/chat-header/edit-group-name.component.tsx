import { FC, useState, useMemo } from 'react';

import { EditFilled, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Input, Button, Flex, Typography, message } from 'antd';
import { useTranslation } from 'react-i18next';

import { useActions, useAppSelector } from 'hooks';
import { useIsGroupAdmin } from 'hooks/use-is-group-admin.hook';
import { useUpdateGroupNameMutation } from 'services/green-api/endpoints';
import { selectActiveChat } from 'store/slices/chat.slice';
import { selectInstance } from 'store/slices/instances.slice';
import { ActiveChat } from 'types';

const EditGroupName: FC = () => {
  const { t } = useTranslation();
  const { setActiveChat } = useActions();

  const activeChat = useAppSelector(selectActiveChat) as ActiveChat;
  const instanceCredentials = useAppSelector(selectInstance);

  const [updateGroupName] = useUpdateGroupNameMutation();

  const isAdmin = useIsGroupAdmin(activeChat);

  const initialName = useMemo(() => {
    return activeChat?.contactInfo !== 'Error: forbidden' &&
      activeChat?.contactInfo &&
      typeof activeChat.contactInfo === 'object' &&
      'subject' in activeChat.contactInfo
      ? activeChat.contactInfo.subject
      : activeChat?.senderName || '';
  }, [activeChat]);

  const [groupName, setGroupName] = useState(initialName);
  const [isEditing, setIsEditing] = useState(false);

  const handleSaveClick = async () => {
    if (!activeChat) return;

    try {
      await updateGroupName({
        groupId: activeChat.chatId,
        groupName,
        ...instanceCredentials,
      });

      setActiveChat({
        ...activeChat,
        senderName: groupName,
        contactInfo:
          typeof activeChat.contactInfo === 'object' &&
          activeChat.contactInfo !== null &&
          'subject' in activeChat.contactInfo
            ? {
                ...activeChat.contactInfo,
                subject: groupName,
              }
            : activeChat.contactInfo,
      });

      setIsEditing(false);
    } catch (error) {
      message.error(t('ERROR_UPDATING_GROUP_NAME'));
    }
  };

  const handleCancelClick = () => {
    setGroupName(initialName);
    setIsEditing(false);
  };

  if (!activeChat) return null;

  return (
    <Flex gap={6} align="center">
      {isEditing ? (
        <>
          <Input
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            style={{ width: 200 }}
          />
          <Button icon={<CheckOutlined />} onClick={handleSaveClick} type="primary" />
          <Button icon={<CloseOutlined />} onClick={handleCancelClick} />
        </>
      ) : (
        <>
          <Typography.Title
            level={2}
            style={{ marginBottom: 'unset' }}
            className="contact-info-name"
          >
            {initialName}
          </Typography.Title>
          {isAdmin && (
            <Button icon={<EditFilled />} onClick={() => setIsEditing(true)} type="text" />
          )}
        </>
      )}
    </Flex>
  );
};

export default EditGroupName;
