import { useMemo } from 'react';

import { useAppSelector } from './redux.hook';
import { TypeInstance } from '../types';
import { selectTypeInstance } from 'store/slices/instances.slice';

export const isTelegramInstance = (typeInstance: TypeInstance) => typeInstance === 'telegram';

export const useIsTelegramInstance = () => {
  const typeInstance = useAppSelector(selectTypeInstance);

  return useMemo(() => isTelegramInstance(typeInstance ?? ''), [typeInstance]);
};
