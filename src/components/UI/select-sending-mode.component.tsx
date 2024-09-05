import { FC } from 'react';

import { PlusOutlined } from '@ant-design/icons';
import { Select } from 'antd';

import SendingModeModal from 'components/modals/sending-mode-modal.component';
import { useActions } from 'hooks';
import { SendingMethodName } from 'types';

const SelectSendingMode: FC = () => {
  const { setActiveSendingMode } = useActions();

  return (
    <>
      <Select
        variant="borderless"
        value=""
        options={[
          { value: 'sendFileByUpload', label: 'Файл' },
          { value: 'sendContact', label: 'Контакт' },
          { value: 'sendLocation', label: 'Локация' },
          { value: 'sendPoll', label: 'Опрос' },
        ]}
        style={{ width: 50 }}
        dropdownStyle={{ width: 120 }}
        suffixIcon={
          <PlusOutlined className="send-mode-select-btn" style={{ pointerEvents: 'none' }} />
        }
        onSelect={(value) => setActiveSendingMode(value as SendingMethodName)}
      />
      <SendingModeModal />
    </>
  );
};

export default SelectSendingMode;
