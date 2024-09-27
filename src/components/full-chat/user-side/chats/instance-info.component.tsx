import { FC } from 'react';

import { useAppSelector } from 'hooks';
import { selectInstance } from 'store/slices/instances.slice';

const InstanceInfo: FC = () => {
  const userCredentials = useAppSelector(selectInstance);

  return <h3 style={{ padding: '10px 45px' }}>idInstance: {userCredentials.idInstance}</h3>;
};

export default InstanceInfo;
