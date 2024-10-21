import { FC, ReactNode, useEffect, useState } from 'react';

import { Select } from 'antd';
import { useTranslation } from 'react-i18next';

import AttachIcon from 'assets/attach-icon.svg?react';
import SendingModal from 'components/modals/sending-modal.component';
import { useActions } from 'hooks';
import { useGetProfileSettingsQuery } from 'services/app/endpoints';
import { SendingMethodName } from 'types';

const SelectSendingMode: FC = () => {
  const { t, i18n } = useTranslation();

  const { setActiveSendingMode } = useActions();

  const dir = i18n.dir();

  const [options, setOptions] = useState<{ value: string; label: string | ReactNode }[]>([
    { value: 'sendFileByUpload', label: t('FILE') },
    { value: 'sendContact', label: t('CONTACT') },
    { value: 'sendLocation', label: t('LOCATION') },
    { value: 'sendPoll', label: t('POLL') },
  ]);

  const { data } = useGetProfileSettingsQuery();

  useEffect(() => {
    if (data && data.result && data.data.isWaba) {
      setOptions((prev) => [...prev, { value: 'sendTemplate', label: t('TEMPLATE') }]);
    }
  }, [data]);

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
    </>
  );
};

export default SelectSendingMode;
