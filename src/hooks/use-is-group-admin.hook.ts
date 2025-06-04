import { useMemo } from 'react';

import { useAppSelector } from 'hooks';
import { useGetWaSettingsQuery } from 'services/green-api/endpoints';
import { selectInstance } from 'store/slices/instances.slice';
import { ActiveChat } from 'types';

export const useIsGroupAdmin = (activeChat: ActiveChat | null): boolean => {
  const instanceCredentials = useAppSelector(selectInstance);

  const { data: waSettings, isLoading } = useGetWaSettingsQuery(instanceCredentials);

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
      !waSettings?.phone ||
      !activeChat ||
      typeof activeChat.contactInfo !== 'object' ||
      !Array.isArray(participants)
    ) {
      return false;
    }

    const currentUserId = `${waSettings.phone}@c.us`;
    return participants.some(
      (participant) => participant.id === currentUserId && participant.isAdmin
    );
  }, [waSettings, isLoading, activeChat]);

  return isAdmin;
};
