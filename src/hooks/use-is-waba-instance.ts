import { useMemo } from 'react';

import { useAppSelector } from './redux.hook';
import { selectInstance, selectInstanceList } from 'store/slices/instances.slice';

const WABA_TYPE_ACCOUNTS = ['waba', 'whatsappbusiness', 'whatsappbusinessapi'];
const WABA_INSTANCE_PREFIXES = ['7835', '9908'];

const normalizeTypeAccount = (value?: string) => value?.toLowerCase().replace(/[\s_-]/g, '') ?? '';

export const useIsWabaInstance = () => {
  const selectedInstance = useAppSelector(selectInstance);
  const instanceList = useAppSelector(selectInstanceList);

  return useMemo(() => {
    const selected = instanceList?.find(
      (instance) => instance.idInstance === selectedInstance?.idInstance
    );

    const normalizedTypeAccount = normalizeTypeAccount(selected?.typeAccount);
    const isWabaById = WABA_INSTANCE_PREFIXES.some((prefix) =>
      selected?.idInstance?.toString().startsWith(prefix)
    );

    return WABA_TYPE_ACCOUNTS.includes(normalizedTypeAccount) || isWabaById;
  }, [instanceList, selectedInstance?.idInstance]);
};
