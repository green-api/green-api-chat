import { FC, useMemo } from 'react';

import { MoreOutlined } from '@ant-design/icons';
import { Dropdown, Menu, message } from 'antd';
import { useTranslation } from 'react-i18next';

import { useAppSelector } from 'hooks';
import {
  useRemoveAdminMutation,
  useRemoveParticipantMutation,
  useSetGroupAdminMutation,
  useGetWaSettingsQuery,
} from 'services/green-api/endpoints';
import { selectActiveChat } from 'store/slices/chat.slice';
import { selectInstance } from 'store/slices/instances.slice';
import { GroupParticipantInterface } from 'types';

interface ParticipantMenuProps {
  participant: GroupParticipantInterface;
}

const ParticipantMenu: FC<ParticipantMenuProps> = ({ participant }) => {
  const { t } = useTranslation();
  const activeChat = useAppSelector(selectActiveChat);
  const instanceCredentials = useAppSelector(selectInstance);
  const { data: waSettings, isLoading } = useGetWaSettingsQuery(instanceCredentials);

  const [removeParticipant] = useRemoveParticipantMutation();
  const [setGroupAdmin] = useSetGroupAdminMutation();
  const [removeAdmin] = useRemoveAdminMutation();

  const participants =
    activeChat &&
    typeof activeChat.contactInfo === 'object' &&
    activeChat.contactInfo !== null &&
    'participants' in activeChat.contactInfo &&
    Array.isArray(activeChat.contactInfo.participants)
      ? activeChat.contactInfo.participants
      : [];

  const isAdmin = useMemo(() => {
    if (
      isLoading ||
      !waSettings?.phone ||
      !activeChat ||
      typeof activeChat.contactInfo !== 'object' ||
      !Array.isArray(participants)
    ) {
      return false;
    }

    const currentUserId = `${waSettings.phone}@c.us`;
    return participants.some((p) => p.id === currentUserId && p.isAdmin);
  }, [waSettings, isLoading, activeChat]);

  if (!activeChat) {
    return null;
  }

  const handleRemoveParticipant = async () => {
    try {
      await removeParticipant({
        groupId: activeChat.chatId,
        participantChatId: participant.id,
        ...instanceCredentials,
      }).unwrap();
      message.success(t('PARTICIPANT_DELETED'));
    } catch {
      message.error(t('ERROR_DELETING_PARTICIPANT'));
    }
  };

  const handleSetAdmin = async () => {
    try {
      await setGroupAdmin({
        groupId: activeChat.chatId,
        participantChatId: participant.id,
        ...instanceCredentials,
      }).unwrap();
      message.success(t('ADMIN_ASSIGNED'));
    } catch {
      message.error(t('ERROR_ASSIGNING_ADMIN'));
    }
  };

  const handleRemoveAdmin = async () => {
    try {
      await removeAdmin({
        groupId: activeChat.chatId,
        participantChatId: participant.id,
        ...instanceCredentials,
      }).unwrap();
      message.success(t('ADMIN_REMOVED'));
    } catch {
      message.error(t('ERROR_REMOVING_ADMIN'));
    }
  };

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === 'remove') {
      handleRemoveParticipant();
    } else if (key === 'setAdmin') {
      handleSetAdmin();
    } else if (key === 'removeAdmin') {
      handleRemoveAdmin();
    }
  };

  if (!isAdmin) return null;

  return (
    <Dropdown
      overlay={
        <Menu onClick={handleMenuClick}>
          {!participant.isAdmin && !participant.isSuperAdmin && (
            <Menu.Item key="setAdmin">{t('ASSIGN_ADMIN')}</Menu.Item>
          )}
          {participant.isAdmin && !participant.isSuperAdmin && (
            <Menu.Item key="removeAdmin">{t('REMOVE_ADMIN')}</Menu.Item>
          )}
          <Menu.Item key="remove" danger>
            {t('DELETE_PARTICIPANT')}
          </Menu.Item>
        </Menu>
      }
      trigger={['click']}
      placement="bottomRight"
    >
      <span style={{ cursor: 'pointer', padding: '4px' }}>
        <MoreOutlined style={{ fontSize: 18 }} />
      </span>
    </Dropdown>
  );
};

export default ParticipantMenu;
