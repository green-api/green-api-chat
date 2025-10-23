import { FC } from 'react';

import { Button, Flex, Popconfirm, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import { useIsMaxInstance } from 'hooks/use-is-max-instance';

interface InstanceDangerZoneProperties {
  onLogout: () => void;
  isLogoutDisabled: boolean;
  isLogouting: boolean;
  instanceStatus?: string;
}

const InstanceDangerZone: FC<InstanceDangerZoneProperties> = ({
  onLogout,
  isLogoutDisabled,
  isLogouting,
  instanceStatus,
}) => {
  const { t } = useTranslation();
  const isMax = useIsMaxInstance();

  return (
    <Flex vertical gap={15}>
      {instanceStatus === 'authorized' && (
        <div className="account-danger-zone">
          <Flex justify="space-between" align="center">
            <div>
              <Typography.Title level={5}>{t('INSTANCE_LOGOUT')}</Typography.Title>
              <div>{t('INSTANCE_LOGOUT_WARNING_TITLE')}</div>
            </div>
            <Popconfirm
              title={
                isMax
                  ? t('INSTANCE_LOGOUT_CONFIRM_TITLE').replaceAll('WhatsApp', '')
                  : t('INSTANCE_LOGOUT_CONFIRM_TITLE')
              }
              okText={t('YES')}
              cancelText={t('NO')}
              onConfirm={onLogout}
            >
              <Button
                type="default"
                className="display-block delete-button"
                disabled={isLogoutDisabled || isLogouting}
                loading={isLogouting}
              >
                {t('INSTANCE_LOGOUT')}
              </Button>
            </Popconfirm>
          </Flex>
        </div>
      )}
    </Flex>
  );
};

export default InstanceDangerZone;
