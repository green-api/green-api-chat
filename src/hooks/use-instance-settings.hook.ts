import { useAppSelector } from './redux.hook';
import { useIsMaxInstance } from './use-is-max-instance';
import { useGetWaSettingsQuery, useGetAccountSettingsQuery } from 'services/green-api/endpoints';
import { selectInstance } from 'store/slices/instances.slice';

export const useInstanceSettings = () => {
  const isMax = useIsMaxInstance();
  const selectedInstance = useAppSelector(selectInstance);

  const skipWa = !selectedInstance?.idInstance || !selectedInstance?.apiTokenInstance || isMax;

  const skipAccount =
    !selectedInstance?.idInstance || !selectedInstance?.apiTokenInstance || !isMax;

  const {
    data: waSettings,
    isLoading: isWaLoading,
    error: waError,
  } = useGetWaSettingsQuery({ ...selectedInstance }, { skip: skipWa });

  const {
    data: accountSettings,
    isLoading: isAccountLoading,
    error: accountError,
  } = useGetAccountSettingsQuery({ ...selectedInstance }, { skip: skipAccount });

  const settings = isMax ? accountSettings : waSettings;
  const isLoading = isMax ? isAccountLoading : isWaLoading;
  const error = isMax ? accountError : waError;

  return { settings, isLoading, error, isMax };
};
