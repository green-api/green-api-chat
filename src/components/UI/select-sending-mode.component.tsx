import { FC } from 'react';

import { PlusOutlined } from '@ant-design/icons';
import { Select } from 'antd';
import { useTranslation } from 'react-i18next';

import SendingModal from 'components/modals/sending-modal.component';
import { useActions } from 'hooks';
import { SendingMethodName } from 'types';

const SelectSendingMode: FC = () => {
  const { t } = useTranslation();

  const { setActiveSendingMode } = useActions();

  return (
    <>
      <Select
        variant="borderless"
        value=""
        options={[
          { value: 'sendFileByUpload', label: t('FILE') },
          { value: 'sendContact', label: t('CONTACT') },
          { value: 'sendLocation', label: t('LOCATION') },
          { value: 'sendPoll', label: t('POLL') },
        ]}
        style={{ width: 50 }}
        dropdownStyle={{ width: 120 }}
        suffixIcon={
          <PlusOutlined className="send-mode-select-btn" style={{ pointerEvents: 'none' }} />
        }
        onSelect={(value) => setActiveSendingMode(value as SendingMethodName)}
      />
      <SendingModal />
    </>
  );
};

export default SelectSendingMode;
