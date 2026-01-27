import { useMemo } from 'react';

import { useInstanceSettings } from './use-instance-settings.hook';
import { useIsMaxInstance } from './use-is-max-instance';
import { useIsTelegramInstance } from './use-is-telegram-instance';
import { useAppSelector } from 'hooks';
import { useGetGroupDataQuery } from 'services/green-api/endpoints';
import { selectInstance } from 'store/slices/instances.slice';
import { ActiveChat } from 'types';

export const useIsGroupAdmin = (activeChat: ActiveChat | null): boolean => {
  const { settings, isLoading } = useInstanceSettings();

  const isMax = useIsMaxInstance();
  const isTelegram = useIsTelegramInstance();
  const instanceCredentials = useAppSelector(selectInstance);

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

  const isAdmin = useMemo(() => {
    const isGroupData = (data: unknown): data is { participants: unknown; owner?: string } => {
      return typeof data === 'object' && data !== null && 'participants' in data;
    };

    const getParticipants = (data: unknown) => {
      if (data && typeof data === 'object' && 'participants' in data) {
        const participants = (data as { participants: unknown }).participants;
        return Array.isArray(participants) ? participants : [];
      }
      return [];
    };

    const participants = isTelegram ? getParticipants(groupData) : getParticipants(activeChat);
    const currentUserId = isMax
      ? settings?.chatId
      : isTelegram
        ? settings?.chatId ?? (isGroupData(groupData) ? groupData.owner : undefined)
        : settings?.phone
          ? `${settings.phone}@c.us`
          : undefined;

    if (isLoading || !currentUserId || !activeChat || !Array.isArray(participants)) {
      return false;
    }

    return participants.some((participant) =>
      isMax || isTelegram
        ? participant.chatId === currentUserId && participant.isAdmin
        : participant.id === currentUserId && participant.isAdmin
    );
  }, [settings, isLoading, activeChat, isMax, isTelegram, groupData]);

  return isAdmin;
};
