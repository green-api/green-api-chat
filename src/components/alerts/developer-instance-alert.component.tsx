import { FC } from 'react';

import { Empty } from 'antd';

import DeveloperInstanceAlertDescription from './developer-instance-alert-description.component';
import { useAppSelector } from 'hooks';
import { selectMiniVersion } from 'store/slices/chat.slice';

const DeveloperInstanceAlert: FC = () => {
  const isMiniVersion = useAppSelector(selectMiniVersion);

  return (
    <Empty
      className={`${isMiniVersion ? 'min-height-460' : 'height-720'} p-10`}
      description={<DeveloperInstanceAlertDescription />}
    />
  );
};

export default DeveloperInstanceAlert;
