import { useEffect } from 'react';

import { useAppSelector } from './redux.hook';
import { useIsMaxInstance } from './use-is-max-instance';
import { useGetWaSettingsQuery, useGetAccountSettingsQuery } from 'services/green-api/endpoints';
import { selectInstance } from 'store/slices/instances.slice';
import { GetWaSettingsResponseInterface } from 'types';
import { isPageInIframe } from 'utils';

interface UseInstanceSettingsOptions {
  pollingInterval?: number;
}

interface UseInstanceSettingsResult {
  settings: GetWaSettingsResponseInterface | undefined;
  isLoading: boolean;
  error: unknown;
  isMax: boolean;
}

export const useInstanceSettings = ({
  pollingInterval,
}: UseInstanceSettingsOptions = {}): UseInstanceSettingsResult => {
  const isMax = useIsMaxInstance();
  const selectedInstance = useAppSelector(selectInstance);

  const skipWa = !selectedInstance?.idInstance || !selectedInstance?.apiTokenInstance || isMax;
  const skipAccount =
    !selectedInstance?.idInstance ||
    !selectedInstance?.apiTokenInstance ||
    (!isMax && isPageInIframe());

  const {
    data: waSettings,
    isLoading: isWaLoading,
    error: waError,
    refetch: refetchWa,
  } = useGetWaSettingsQuery({ ...selectedInstance }, { skip: skipWa, pollingInterval });

  const {
    data: accountSettings,
    isLoading: isAccountLoading,
    error: accountError,
    refetch: refetchAccount,
  } = useGetAccountSettingsQuery({ ...selectedInstance }, { skip: skipAccount, pollingInterval });

  const settings = accountSettings ?? waSettings;
  const isLoading = isAccountLoading ?? isWaLoading;
  const error = accountError ?? waError;
  const refetch = refetchAccount ?? refetchWa;

  useEffect(() => {
    if (error && typeof error === 'object' && 'status' in error) {
      const status = error.status;
      if (status === 429) {
        const timeout = setTimeout(() => {
          refetch();
        }, 3000);
        return () => clearTimeout(timeout);
      }
    }
  }, [error, refetch]);

  return { settings, isLoading, error, isMax };
};
