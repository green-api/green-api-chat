import { FC } from 'react';

import { LoadingOutlined } from '@ant-design/icons';
import { Space, Spin } from 'antd';

import { isMaxInstance } from 'hooks/use-is-max-instance';
import { useGetWaSettingsQuery, useGetAccountSettingsQuery } from 'services/green-api/endpoints';
import { ExpandedInstanceInterface, StateInstanceEnum } from 'types';

const SelectInstanceLabel: FC<
  Pick<
    ExpandedInstanceInterface,
    'name' | 'idInstance' | 'apiTokenInstance' | 'apiUrl' | 'mediaUrl' | 'typeInstance'
  >
> = ({ idInstance, apiTokenInstance, apiUrl, mediaUrl, name, typeInstance }) => {
  const isMax = isMaxInstance(typeInstance);

  const { data: waSettings, isLoading: isLoadingWaSettings } = useGetWaSettingsQuery(
    {
      idInstance,
      apiTokenInstance,
      apiUrl,
      mediaUrl,
    },
    {
      skip: isMax,
    }
  );

  const { data: accountSettings, isLoading: isLoadingAccountSettings } = useGetAccountSettingsQuery(
    {
      idInstance,
      apiTokenInstance,
      apiUrl,
      mediaUrl,
    },
    {
      skip: !isMax,
    }
  );

  const settings = isMax ? accountSettings : waSettings;
  const isLoading = isMax ? isLoadingAccountSettings : isLoadingWaSettings;

  return (
    <Space align="center" size="small">
      {isLoading ? (
        <Space align="center" size="small">
          <Spin indicator={<LoadingOutlined />} /> {idInstance} {name}
        </Space>
      ) : (
        <span
          className={`statusCircle ${
            settings?.stateInstance === StateInstanceEnum.Authorized
              ? 'statusCircle__auth'
              : 'statusCircle__notAuth'
          }`}
        ></span>
      )}
      {idInstance} {name} {settings?.phone}
    </Space>
  );
};

export default SelectInstanceLabel;
