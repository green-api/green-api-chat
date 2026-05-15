import { useMemo, useRef } from 'react';

import { useAppSelector } from 'hooks';
import {
  useGetIncomingStatusesQuery,
  useGetOutgoingStatusesQuery,
} from 'services/green-api/endpoints';
import { selectInstance } from 'store/slices/instances.slice';
import type { StatusJournalItemInterface } from 'types';

import { getStatusTitle, isRenderableStatus } from './status-history.utils';

const OPTIMISTIC_TTL_MS = 30000;
const DUPLICATE_TIME_WINDOW_SEC = 90;

const isOptimisticStatus = (status: StatusJournalItemInterface) =>
  typeof status.idMessage === 'string' && status.idMessage.startsWith('optimistic-');

const isSameStatus = (
  server: StatusJournalItemInterface,
  optimistic: StatusJournalItemInterface
) => {
  if (server.idMessage === optimistic.idMessage) return true;
  if (server.typeMessage !== optimistic.typeMessage) return false;
  if (server.chatId !== optimistic.chatId) return false;
  if (Math.abs(server.timestamp - optimistic.timestamp) > DUPLICATE_TIME_WINDOW_SEC) return false;

  if (optimistic.typeMessage === 'extendedTextMessage') {
    const serverText = server.extendedTextMessage?.text || server.textMessage || '';
    const optimisticText = optimistic.extendedTextMessage?.text || optimistic.textMessage || '';
    return serverText === optimisticText;
  }

  if (optimistic.typeMessage === 'audioMessage') {
    return (server.fileName || '') === (optimistic.fileName || '');
  }

  if (optimistic.typeMessage === 'imageMessage' || optimistic.typeMessage === 'videoMessage') {
    const serverFileName = (server.fileName || '').trim();
    const optimisticFileName = (optimistic.fileName || '').trim();
    if (serverFileName && optimisticFileName) return serverFileName === optimisticFileName;

    const serverUrl = (server.downloadUrl || '').trim();
    const optimisticUrl = (optimistic.downloadUrl || '').trim();
    if (serverUrl && optimisticUrl) return serverUrl === optimisticUrl;
  }

  return (server.caption || '').trim() === (optimistic.caption || '').trim();
};

export interface StatusContactGroup {
  chatId: string;
  latestStatus: StatusJournalItemInterface;
  statuses: StatusJournalItemInterface[];
  title: string;
}

const groupStatusesByContact = (statuses: StatusJournalItemInterface[]): StatusContactGroup[] => {
  const map = new Map<string, StatusJournalItemInterface[]>();

  statuses.forEach((status) => {
    const chatId = status.chatId || status.senderId || status.idMessage;
    const existing = map.get(chatId) || [];
    existing.push(status);
    map.set(chatId, existing);
  });

  return Array.from(map.entries())
    .map(([chatId, contactStatuses]) => {
      const sortedByNewest = [...contactStatuses].sort((a, b) => b.timestamp - a.timestamp);

      return {
        chatId,
        latestStatus: sortedByNewest[0],
        statuses: [...contactStatuses].sort((a, b) => a.timestamp - b.timestamp),
        title: getStatusTitle(sortedByNewest[0]),
      };
    })
    .sort((a, b) => b.latestStatus.timestamp - a.latestStatus.timestamp);
};

export const useStatusesHistory = () => {
  const optimisticPoolRef = useRef<
    Map<string, { status: StatusJournalItemInterface; createdAt: number }>
  >(new Map());
  const instanceCredentials = useAppSelector(selectInstance);
  const skipQuery = !instanceCredentials?.idInstance || !instanceCredentials?.apiTokenInstance;
  const statusQueryArgs = {
    idInstance: instanceCredentials.idInstance,
    apiTokenInstance: instanceCredentials.apiTokenInstance,
    apiUrl: instanceCredentials.apiUrl,
    mediaUrl: instanceCredentials.mediaUrl,
    minutes: 1440,
  };

  const {
    data: incoming = [],
    isLoading: isIncomingLoading,
    isFetching: isIncomingFetching,
    error: incomingError,
  } = useGetIncomingStatusesQuery(statusQueryArgs, {
    skip: skipQuery,
    pollingInterval: 5000,
    skipPollingIfUnfocused: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const {
    data: outgoing = [],
    isLoading: isOutgoingLoading,
    isFetching: isOutgoingFetching,
    error: outgoingError,
  } = useGetOutgoingStatusesQuery(statusQueryArgs, {
    skip: skipQuery,
    pollingInterval: 10000,
    skipPollingIfUnfocused: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const groupedStatuses = useMemo(() => {
    const now = Date.now();
    const pool = optimisticPoolRef.current;

    outgoing.forEach((status) => {
      if (isOptimisticStatus(status) && !pool.has(status.idMessage)) {
        pool.set(status.idMessage, { status, createdAt: now });
      }
    });

    const serverOutgoing = outgoing.filter((item) => !isOptimisticStatus(item));
    const poolItems = Array.from(pool.values());

    const activeOptimistic = poolItems
      .filter(({ createdAt, status }) => {
        if (now - createdAt > OPTIMISTIC_TTL_MS) return false;
        const matched = serverOutgoing.some((serverStatus) => isSameStatus(serverStatus, status));
        return !matched;
      })
      .map((item) => item.status);

    pool.forEach((item, key) => {
      const expired = now - item.createdAt > OPTIMISTIC_TTL_MS;
      const matched = serverOutgoing.some((serverStatus) =>
        isSameStatus(serverStatus, item.status)
      );
      if (expired || matched) pool.delete(key);
    });

    const mappedIncoming = incoming.map((item) => ({ ...item, type: 'incoming' as const }));
    const mappedOutgoing = [...serverOutgoing, ...activeOptimistic].map((item) => ({
      ...item,
      type: 'outgoing' as const,
    }));
    const combinedStatuses = [...mappedIncoming, ...mappedOutgoing]
      .filter(isRenderableStatus)
      .sort((a, b) => b.timestamp - a.timestamp);

    return groupStatusesByContact(combinedStatuses);
  }, [incoming, outgoing]);

  return {
    groupedStatuses,
    hasError: !!incomingError || !!outgoingError,
    isFetching: isIncomingFetching || isOutgoingFetching,
    isLoading: isIncomingLoading || isOutgoingLoading,
  };
};
