import { FC } from 'react';

import { LoadingOutlined } from '@ant-design/icons';
import { Space, Spin } from 'antd';

import { useGetWaSettingsQuery } from 'services/green-api/endpoints';
import { ExpandedInstanceInterface, StateInstanceEnum } from 'types';

const SelectInstanceLabel: FC<
  Pick<ExpandedInstanceInterface, 'name' | 'idInstance' | 'apiTokenInstance'>
> = ({ idInstance, apiTokenInstance, name }) => {
  const { data: waSettings, isLoading: isLoadingWaSettings } = useGetWaSettingsQuery({
    idInstance,
    apiTokenInstance,
  });

  return (
    <Space align="center" size="small">
      {isLoadingWaSettings ? (
        <Space align="center" size="small">
          <Spin indicator={<LoadingOutlined />} /> {idInstance} {name}
        </Space>
      ) : (
        <span
          className={`statusCircle ${
            waSettings?.stateInstance === StateInstanceEnum.Authorized
              ? 'statusCircle__auth'
              : 'statusCircle__notAuth'
          }`}
        ></span>
      )}
      {idInstance} {name} {waSettings && waSettings.phone}
    </Space>
  );
};

export default SelectInstanceLabel;
