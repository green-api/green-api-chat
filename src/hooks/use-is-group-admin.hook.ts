import { useMemo } from 'react';

import { useInstanceSettings } from './use-instance-settings.hook';
import { useIsMaxInstance } from './use-is-max-instance';
import { ActiveChat } from 'types';

export const useIsGroupAdmin = (activeChat: ActiveChat | null): boolean => {
  const { settings, isLoading } = useInstanceSettings();

  const isMax = useIsMaxInstance();

  const isAdmin = useMemo(() => {
    const participants =
      activeChat &&
      typeof activeChat.contactInfo === 'object' &&
      activeChat.contactInfo !== null &&
      'participants' in activeChat.contactInfo &&
      Array.isArray(activeChat.contactInfo.participants)
        ? activeChat.contactInfo.participants
        : [];

    if (
      isLoading ||
      (!isMax && !settings?.phone) ||
      (isMax && !settings?.chatId) ||
      !activeChat ||
      typeof activeChat.contactInfo !== 'object' ||
      !Array.isArray(participants)
    ) {
      return false;
    }

    const currentUserId = isMax ? settings?.chatId : `${settings?.phone}@c.us`;
    return participants.some((participant) =>
      !isMax
        ? participant.id === currentUserId && participant.isAdmin
        : participant.chatId === currentUserId
    );
  }, [settings, isLoading, activeChat]);

  return isAdmin;
};
