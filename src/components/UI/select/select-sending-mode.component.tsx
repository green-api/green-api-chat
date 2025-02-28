import { FC } from 'react';

import { Select } from 'antd';
import { useTranslation } from 'react-i18next';

import AttachIcon from 'assets/attach-icon.svg?react';
import MessageServiceModal from 'components/modals/message-service-modal.component';
import SendingModal from 'components/modals/sending-modal.component';
import { useActions } from 'hooks';
import { SendingMethodName } from 'types';

interface SelectSendingModeProps {
  isWaba?: boolean;
}

const SelectSendingMode: FC<SelectSendingModeProps> = ({ isWaba }) => {
  const { t, i18n } = useTranslation();

  const { setActiveSendingMode } = useActions();

  const dir = i18n.dir();

  const options = [
    { value: 'sendFileByUpload', label: t('FILE') },
    { value: 'sendContact', label: t('CONTACT') },
    { value: 'sendLocation', label: t('LOCATION') },
    { value: 'sendPoll', label: t('POLL') },
  ];

  if (isWaba) {
    options.push({ value: 'sendTemplate', label: t('TEMPLATE') });
  }

  return (
    <>
      <Select
        className={`select-sending-mode ${dir === 'rtl' ? 'rtl' : ''}`}
        variant="borderless"
        value=""
        options={options}
        style={{ width: 50 }}
        dropdownStyle={{ width: 120 }}
        suffixIcon={<AttachIcon style={{ pointerEvents: 'none' }} />}
        onSelect={(value) => setActiveSendingMode(value as SendingMethodName)}
      />
      <SendingModal />
      <MessageServiceModal />
    </>
  );
};

export default SelectSendingMode;
