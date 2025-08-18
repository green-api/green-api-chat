import { useMemo } from 'react';

import { useAppSelector } from './redux.hook';
import { TypeInstance } from '../types';
import { selectTypeInstance } from 'store/slices/instances.slice';

export const isMaxInstance = (typeInstance: TypeInstance) => typeInstance === 'v3';

export const useIsMaxInstance = () => {
  const typeInstance = useAppSelector(selectTypeInstance);

  return useMemo(() => isMaxInstance(typeInstance ?? ''), [typeInstance]);
};
