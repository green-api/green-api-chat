import { useMemo } from 'react';

import { useAppSelector } from 'hooks';
import {
  useGetIncomingStatusesQuery,
  useGetOutgoingStatusesQuery,
} from 'services/green-api/endpoints';
import { selectInstance } from 'store/slices/instances.slice';
import type { StatusJournalItemInterface } from 'types';

import { getStatusTitle, isRenderableStatus } from './status-history.utils';

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
  const instanceCredentials = useAppSelector(selectInstance);
  const skipQuery = !instanceCredentials?.idInstance || !instanceCredentials?.apiTokenInstance;

  const {
    data: incoming = [],
    isLoading: isIncomingLoading,
    isFetching: isIncomingFetching,
    error: incomingError,
  } = useGetIncomingStatusesQuery(
    {
      ...instanceCredentials,
      minutes: 1440,
    },
    { skip: skipQuery }
  );

  const {
    data: outgoing = [],
    isLoading: isOutgoingLoading,
    isFetching: isOutgoingFetching,
    error: outgoingError,
  } = useGetOutgoingStatusesQuery(
    {
      ...instanceCredentials,
      minutes: 1440,
    },
    { skip: skipQuery }
  );

  const groupedStatuses = useMemo(() => {
    const mappedIncoming = incoming.map((item) => ({ ...item, type: 'incoming' as const }));
    const mappedOutgoing = outgoing.map((item) => ({ ...item, type: 'outgoing' as const }));
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
