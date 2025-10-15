import { FC } from 'react';

import { useTranslation } from 'react-i18next';

import { useInstanceSettings } from 'hooks/use-instance-settings.hook';
import { StateInstanceEnum } from 'types';

interface Properties {
  style?: React.CSSProperties;
}

const AuthorizationStatus: FC<Properties> = ({ style }) => {
  const { t } = useTranslation();

  const { settings, isLoading } = useInstanceSettings();

  const state = settings?.stateInstance;

  if (isLoading) return null;

  const isAuthorized = state === StateInstanceEnum.Authorized;

  return (
    <div
      style={{
        ...style,
        padding: '4px 10px',
        borderRadius: 4,
        width: 'fit-content',
        textWrap: 'nowrap',
        textAlign: 'center',
        color: isAuthorized ? 'var(--authorized-text-color)' : 'var(--not-authorized-text-color)',
        backgroundColor: isAuthorized
          ? 'var(--authorized-header-color)'
          : 'var(--not-authorized-header-color)',
      }}
    >
      {isAuthorized ? t('AUTHORIZED') : t('NOT_AUTHORIZED')}
    </div>
  );
};

export default AuthorizationStatus;
