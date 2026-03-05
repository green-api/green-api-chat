import { FC } from 'react';

import { useTranslation } from 'react-i18next';

import { useAppSelector } from 'hooks';
import { useInstanceSettings } from 'hooks/use-instance-settings.hook';
import { selectIsLastMessagesSyncingAfterAuthorization } from 'store/slices/instances.slice';
import { StateInstanceEnum } from 'types';

interface Properties {
  style?: React.CSSProperties;
}

const AuthorizationStatus: FC<Properties> = ({ style }) => {
  const { t } = useTranslation();
  const { settings, isLoading } = useInstanceSettings();
  const isLastMessagesSyncingAfterAuthorization = useAppSelector(
    selectIsLastMessagesSyncingAfterAuthorization
  );

  const state = settings?.stateInstance;

  if (isLoading && !isLastMessagesSyncingAfterAuthorization) return null;

  const isAuthorized =
    state === StateInstanceEnum.Authorized || isLastMessagesSyncingAfterAuthorization;
  const isSuspended = state === StateInstanceEnum.Suspended;

  let text = '';
  let backgroundColor = '';
  let color = '';

  if (isAuthorized) {
    text = t('AUTHORIZED');
    backgroundColor = 'var(--authorized-header-color)';
    color = 'var(--authorized-text-color)';
  } else if (isSuspended) {
    text = 'Suspended';
    backgroundColor = 'var(--suspended-header-bg)';
    color = 'var(--suspended-header-color)';
  } else {
    text = t('NOT_AUTHORIZED');
    backgroundColor = 'var(--not-authorized-header-color)';
    color = 'var(--not-authorized-text-color)';
  }

  return (
    <div
      style={{
        ...style,
        padding: '4px 10px',
        borderRadius: 4,
        width: 'fit-content',
        textWrap: 'nowrap',
        textAlign: 'center',
        color,
        backgroundColor,
      }}
    >
      {text}
    </div>
  );
};

export default AuthorizationStatus;
