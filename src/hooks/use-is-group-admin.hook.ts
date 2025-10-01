import { useMemo } from 'react';

import { useIsMaxInstance } from './use-is-max-instance';
import { useAppSelector } from 'hooks';
import { useGetAccountSettingsQuery, useGetWaSettingsQuery } from 'services/green-api/endpoints';
import { selectInstance } from 'store/slices/instances.slice';
import { ActiveChat } from 'types';

export const useIsGroupAdmin = (activeChat: ActiveChat | null): boolean => {
  const instanceCredentials = useAppSelector(selectInstance);

  const isMax = useIsMaxInstance();

  const { data: waSettings, isLoading: isLoadingWaSettings } =
    useGetWaSettingsQuery(instanceCredentials);

  const { data: accountSettings, isLoading: isLoadingAccountSettings } = useGetAccountSettingsQuery(
    instanceCredentials,
    {
      skip: !isMax,
    }
  );

  const settings = isMax ? accountSettings : waSettings;
  const isLoading = isMax ? isLoadingAccountSettings : isLoadingWaSettings;

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
