import { useMemo } from 'react';

import { useAppSelector } from './redux.hook';

export const isMaxInstance = (typeInstance: string) => typeInstance === 'v3';

export const useIsMaxInstance = () => {
  const selectedInstance = useAppSelector((state) => state.instancesReducer.selectedInstance);
  console.log(selectedInstance);

  return useMemo(() => isMaxInstance(selectedInstance.typeInstance ?? ''), [selectedInstance]);
};
