import { FC } from 'react';

import { useAppSelector } from 'hooks';
import { selectCredentials } from 'store/slices/user.slice';

const InstanceInfo: FC = () => {
  const userCredentials = useAppSelector(selectCredentials);

  return <h3 style={{ padding: '10px 45px' }}>idInstance: {userCredentials.idInstance}</h3>;
};

export default InstanceInfo;
