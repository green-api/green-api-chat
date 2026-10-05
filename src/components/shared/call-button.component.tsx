import { FC, MouseEvent } from 'react';

import { Button, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import PhoneIcon from 'assets/icons/phone.svg?react';
import { useAppSelector } from 'hooks';
import { selectEnableCalls, selectInstanceTariff } from 'store/slices/instances.slice';

export interface PendingCallInterface {
  chatId: string;
  phone?: string;
  name?: string;
  avatar?: string;
}

interface CallButtonProps {
  pendingCall?: PendingCallInterface;
  variant?: 'link' | 'icon' | 'labeled';
}

const CallButton: FC<CallButtonProps> = ({ pendingCall, variant = 'icon' }) => {
  const { t } = useTranslation();
  const enableCalls = useAppSelector(selectEnableCalls);
  const tariff = useAppSelector(selectInstanceTariff);

  const handleClick = (event: MouseEvent) => {
    event.stopPropagation();

    if (enableCalls) {
      window.parent.postMessage(
        { event: 'openCalls', ...(pendingCall ? { pendingCall } : {}) },
        '*'
      );
      return;
    }

    window.parent.postMessage({ event: 'callsUnavailable', tariff }, '*');
  };

  if (variant === 'link') {
    return (
      <Typography.Link
        className="call-icon-link"
        onClick={handleClick}
        title={t('CALL_BUTTON_TITLE')}
      >
        <PhoneIcon className="call-icon" />
      </Typography.Link>
    );
  }

  if (variant === 'labeled') {
    return (
      <Button
        icon={<PhoneIcon className="call-icon" />}
        size="large"
        onClick={handleClick}
        title={t('CALL_BUTTON_TITLE')}
      >
        {t('CALL_BUTTON_TITLE')}
      </Button>
    );
  }

  return (
    <Button
      className="call-button"
      icon={<PhoneIcon className="call-icon" />}
      onClick={handleClick}
      title={t('CALL_BUTTON_TITLE')}
    />
  );
};

export default CallButton;
