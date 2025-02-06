import { FC, useMemo } from 'react';

import { Modal } from 'antd';

import { SENDING_METHODS_CONFIG } from 'configs';
import { useActions, useAppSelector } from 'hooks';
import { selectActiveSendingMode } from 'store/slices/chat.slice';

const SendingModal: FC = () => {
  const activeSendingMode = useAppSelector(selectActiveSendingMode);

  const modalContent = useMemo(
    () => SENDING_METHODS_CONFIG.find((config) => config.name === activeSendingMode),
    [activeSendingMode]
  );

  const { setActiveSendingMode, setActiveTemplate } = useActions();

  const reset = () => {
    setActiveSendingMode(null);
    setActiveTemplate(null);
  };

  return (
    <Modal
      centered
      open={!!activeSendingMode}
      onCancel={reset}
      footer={null}
      width={780}
      destroyOnClose
    >
      {modalContent?.element}
    </Modal>
  );
};

export default SendingModal;
