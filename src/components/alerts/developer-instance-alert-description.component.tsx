import { FC } from 'react';

import { Button, Space } from 'antd';
import { useTranslation } from 'react-i18next';

import { useActions, useAppSelector } from 'hooks';
import { selectIsChatWorking } from 'store/slices/instances.slice';

const DeveloperInstanceAlertDescription: FC = () => {
  const isChatWorking = useAppSelector(selectIsChatWorking);

  const { setIsChatWorking } = useActions();

  const { t } = useTranslation();

  if (isChatWorking === false) {
    return (
      <Space direction="vertical">
        <p>{t('TURNED_OFF_CHATS_ALERT')}</p>
        <Button onClick={() => setIsChatWorking(true)}>{t('TURN_ON_CHAT')}</Button>
      </Space>
    );
  }

  return (
    <Space direction="vertical">
      <p>{t('DEVELOPER_INSTANCE_ALERT')}</p>
      <Space>
        <Button onClick={() => setIsChatWorking(true)}>{t('YES')}</Button>
        <Button onClick={() => setIsChatWorking(false)}>{t('NO')}</Button>
      </Space>
    </Space>
  );
};

export default DeveloperInstanceAlertDescription;
