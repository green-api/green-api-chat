import { LoadingOutlined } from '@ant-design/icons';
import { Image, Flex, Space, Spin } from 'antd';

import maxIcon from 'assets/max-logo.svg';
import waIcon from 'assets/wa-logo.svg';
import { isMaxInstance } from 'hooks/use-is-max-instance';
import { useGetWaSettingsQuery, useGetAccountSettingsQuery } from 'services/green-api/endpoints';
import { ExpandedInstanceInterface, StateInstanceEnum } from 'types';

const SelectInstanceLabel = ({
  idInstance,
  apiTokenInstance,
  apiUrl,
  mediaUrl,
  name,
  typeInstance,
}: Pick<
  ExpandedInstanceInterface,
  'name' | 'idInstance' | 'apiTokenInstance' | 'apiUrl' | 'mediaUrl' | 'typeInstance'
>) => {
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
        <Flex gap={8} align="center">
          <Image
            style={{ verticalAlign: 'text-bottom' }}
            preview={false}
            width={16}
            src={isMax ? maxIcon : waIcon}
          />
          <div
            className={`statusCircle ${
              settings?.stateInstance === StateInstanceEnum.Authorized
                ? 'statusCircle__auth'
                : 'statusCircle__notAuth'
            }`}
          />
        </Flex>
      )}
      {idInstance} {name} {settings?.phone}
    </Space>
  );
};

export default SelectInstanceLabel;
