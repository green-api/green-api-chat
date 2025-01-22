import { FC } from 'react';

import { Button, Empty, Space } from 'antd';
import { useTranslation } from 'react-i18next';

import { useActions, useAppSelector } from 'hooks';
import { selectMiniVersion } from 'store/slices/chat.slice';
import { selectIsChatWorking } from 'store/slices/instances.slice';

const DeveloperInstanceAlert: FC = () => {
  const isChatWorking = useAppSelector(selectIsChatWorking);
  const isMiniVersion = useAppSelector(selectMiniVersion);

  const { setIsChatWorking } = useActions();

  const { t } = useTranslation();

  let content = (
    <>
      <p>{t('DEVELOPER_INSTANCE_ALERT')}</p>
      <Space>
        <Button onClick={() => setIsChatWorking(true)}>{t('YES')}</Button>
        <Button onClick={() => setIsChatWorking(false)}>{t('NO')}</Button>
      </Space>
    </>
  );

  if (isChatWorking === false) {
    content = (
      <>
        <p>{t('TURNED_OFF_CHATS_ALERT')}</p>
        <Button onClick={() => setIsChatWorking(true)}>{t('TURN_ON_CHAT')}</Button>
      </>
    );
  }

  const description = <Space direction="vertical">{content}</Space>;

  return (
    <Empty
      className={`${isMiniVersion ? 'min-height-460' : 'height-720'} p-10`}
      description={description}
    />
  );
};

export default DeveloperInstanceAlert;
