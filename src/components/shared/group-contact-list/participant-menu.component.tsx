import { FC, useMemo } from 'react';

import { MoreOutlined } from '@ant-design/icons';
import { Dropdown, Menu, message } from 'antd';
import { useTranslation } from 'react-i18next';

import { useActions, useAppSelector } from 'hooks';
import { useIsMaxInstance } from 'hooks/use-is-max-instance';
import {
  useRemoveAdminMutation,
  useRemoveParticipantMutation,
  useSetGroupAdminMutation,
  useGetWaSettingsQuery,
  useGetAccountSettingsQuery,
} from 'services/green-api/endpoints';
import { selectActiveChat } from 'store/slices/chat.slice';
import { selectInstance } from 'store/slices/instances.slice';
import { GroupParticipantInterface, GetGroupDataSuccessResponseInterface } from 'types';

interface ParticipantMenuProps {
  participant: GroupParticipantInterface;
}

const isGroupData = (contactInfo: unknown): contactInfo is GetGroupDataSuccessResponseInterface => {
  return (
    typeof contactInfo === 'object' &&
    contactInfo !== null &&
    'participants' in contactInfo &&
    Array.isArray((contactInfo as { participants?: unknown }).participants)
  );
};

const ParticipantMenu: FC<ParticipantMenuProps> = ({ participant }) => {
  const isMax = useIsMaxInstance();
  const { t } = useTranslation();
  const { setActiveChat } = useActions();

  const activeChat = useAppSelector(selectActiveChat);
  const instanceCredentials = useAppSelector(selectInstance);

  const { data: waSettings, isLoading: isLoadingWaSettings } =
    useGetWaSettingsQuery(instanceCredentials);
  const { data: accountSettings, isLoading: isLoadingAccountSettings } = useGetAccountSettingsQuery(
    instanceCredentials,
    { skip: !isMax }
  );

  const settings = isMax ? accountSettings : waSettings;
  const isLoading = isMax ? isLoadingAccountSettings : isLoadingWaSettings;

  const [removeParticipant] = useRemoveParticipantMutation();
  const [setGroupAdmin] = useSetGroupAdminMutation();
  const [removeAdmin] = useRemoveAdminMutation();

  const isAdmin = useMemo(() => {
    if (
      isLoading ||
      (!isMax && !settings?.phone) ||
      (isMax && !settings?.chatId) ||
      !activeChat ||
      !isGroupData(activeChat.contactInfo)
    ) {
      return false;
    }

    const currentUserId = isMax ? settings?.chatId : `${settings?.phone}@c.us`;
    return activeChat.contactInfo.participants.some((p) =>
      isMax ? p.chatId === currentUserId && p.isAdmin : p.id === currentUserId && p.isAdmin
    );
  }, [settings, isLoading, activeChat]);

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
        ...(isMax ? { chatId: activeChat.chatId } : { groupId: activeChat.chatId }),
        participantChatId: isMax ? participant.chatId ?? '' : participant.id,
        ...instanceCredentials,
      }).unwrap();

      if (activeChat && isGroupData(activeChat.contactInfo)) {
        const updatedParticipants = activeChat.contactInfo.participants.map((p) =>
          p.chatId === participant.chatId ? { ...p, isAdmin: true } : p
        );

        setActiveChat({
          ...activeChat,
          contactInfo: {
            ...activeChat.contactInfo,
            participants: updatedParticipants,
          },
        });
      }

      message.success(t('ADMIN_ASSIGNED'));
    } catch {
      message.error(t('ERROR_ASSIGNING_ADMIN'));
    }
  };

  const handleRemoveAdmin = async () => {
    try {
      await removeAdmin({
        ...(isMax ? { chatId: activeChat.chatId } : { groupId: activeChat.chatId }),
        participantChatId: isMax ? participant.chatId ?? '' : participant.id,
        ...instanceCredentials,
      }).unwrap();

      if (activeChat && isGroupData(activeChat.contactInfo)) {
        const updatedParticipants = activeChat.contactInfo.participants.map((p) =>
          p.chatId === participant.chatId ? { ...p, isAdmin: false } : p
        );

        setActiveChat({
          ...activeChat,
          contactInfo: {
            ...activeChat.contactInfo,
            participants: updatedParticipants,
          },
        });
      }

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
