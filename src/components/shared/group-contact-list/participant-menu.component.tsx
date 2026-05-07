import { FC, useMemo } from 'react';

import { MoreOutlined } from '@ant-design/icons';
import { Dropdown, Menu, message } from 'antd';
import { useTranslation } from 'react-i18next';

import { useActions, useAppSelector } from 'hooks';
import { useInstanceSettings } from 'hooks/use-instance-settings.hook';
import { useIsMaxInstance } from 'hooks/use-is-max-instance';
import { useIsTelegramInstance } from 'hooks/use-is-telegram-instance';
import {
  useRemoveAdminMutation,
  useRemoveParticipantMutation,
  useSetGroupAdminMutation,
} from 'services/green-api/endpoints';
import { useGetGroupDataQuery } from 'services/green-api/endpoints';
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
  const isTelegram = useIsTelegramInstance();
  const { t } = useTranslation();
  const { setActiveChat } = useActions();

  const activeChat = useAppSelector(selectActiveChat);
  const instanceCredentials = useAppSelector(selectInstance);

  const { settings, isLoading } = useInstanceSettings();

  const { data: groupData } = useGetGroupDataQuery(
    {
      ...instanceCredentials,
      chatId: activeChat?.chatId ?? '',
    },
    {
      skip:
        !isTelegram ||
        !activeChat?.chatId ||
        !instanceCredentials?.idInstance ||
        !instanceCredentials?.apiTokenInstance,
    }
  );

  const [removeParticipant] = useRemoveParticipantMutation();
  const [setGroupAdmin] = useSetGroupAdminMutation();
  const [removeAdmin] = useRemoveAdminMutation();

  const isAdmin = useMemo(() => {
    if (
      isLoading ||
      (!isMax && !settings?.phone) ||
      (isMax && !settings?.chatId) ||
      (isTelegram && !settings?.chatId) ||
      !activeChat ||
      (!isTelegram && !isGroupData(activeChat.contactInfo))
    ) {
      return false;
    }

    const currentUserId = isMax || isTelegram ? settings?.chatId : `${settings?.phone}@c.us`;
    const participants = isTelegram
      ? isGroupData(groupData)
        ? groupData.participants
        : []
      : isGroupData(activeChat.contactInfo)
        ? activeChat.contactInfo.participants
        : [];

    return participants.some((p) =>
      isMax || isTelegram
        ? p.chatId === currentUserId && p.isAdmin
        : p.id === currentUserId && p.isAdmin
    );
  }, [settings, isLoading, activeChat, isTelegram, isMax, groupData]);

  if (!activeChat) {
    return null;
  }

  const handleRemoveParticipant = async () => {
    try {
      const res = await removeParticipant({
        ...(isMax || isTelegram ? { chatId: activeChat.chatId } : { groupId: activeChat.chatId }),
        participantChatId: isMax || isTelegram ? participant.chatId ?? '' : participant.id,
        ...instanceCredentials,
      }).unwrap();
      if (!!res.removeParticipant) {
        message.success(t('PARTICIPANT_DELETED'));
      }
      if (!res.removeParticipant) message.error(t('ERROR_DELETING_PARTICIPANT'));
    } catch {
      message.error(t('ERROR_DELETING_PARTICIPANT'));
    }
  };

  const handleSetAdmin = async () => {
    try {
      const res = await setGroupAdmin({
        ...(isMax || isTelegram ? { chatId: activeChat.chatId } : { groupId: activeChat.chatId }),
        participantChatId: isMax || isTelegram ? participant.chatId ?? '' : participant.id,
        ...instanceCredentials,
      }).unwrap();

      if (!isTelegram && activeChat && isGroupData(activeChat.contactInfo)) {
        const updatedParticipants = activeChat.contactInfo.participants.map((p) =>
          p.chatId === participant.chatId ? { ...p, isAdmin: true } : p
        );
        if (!!res.setGroupAdmin) {
          setActiveChat({
            ...activeChat,
            contactInfo: {
              ...activeChat.contactInfo,
              participants: updatedParticipants,
            },
          });
          message.success(t('ADMIN_ASSIGNED'));
        }
      }
      if (!res.setGroupAdmin) message.error(t('ERROR_ASSIGNING_ADMIN'));
    } catch {
      message.error(t('ERROR_ASSIGNING_ADMIN'));
    }
  };

  const handleRemoveAdmin = async () => {
    try {
      const res = await removeAdmin({
        ...(isMax || isTelegram ? { chatId: activeChat.chatId } : { groupId: activeChat.chatId }),
        participantChatId: isMax || isTelegram ? participant.chatId ?? '' : participant.id,
        ...instanceCredentials,
      }).unwrap();

      if (!isTelegram && activeChat && isGroupData(activeChat.contactInfo)) {
        const updatedParticipants = activeChat.contactInfo.participants.map((p) =>
          p.chatId === participant.chatId ? { ...p, isAdmin: false } : p
        );
        if (!!res.removeAdmin) {
          setActiveChat({
            ...activeChat,
            contactInfo: {
              ...activeChat.contactInfo,
              participants: updatedParticipants,
            },
          });
          message.success(t('ADMIN_REMOVED'));
        }
      }
      if (!res.removeAdmin) message.error(t('ERROR_REMOVING_ADMIN'));
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
