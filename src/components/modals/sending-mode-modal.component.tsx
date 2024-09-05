import { FC } from 'react';

import { Modal } from 'antd';

import { SENDING_METHODS_CONFIG } from 'configs';
import { useActions, useAppSelector } from 'hooks';
import { selectActiveSendingMode } from 'store/slices/chat.slice';

const SendingModeModal: FC = () => {
  const activeSendingMode = useAppSelector(selectActiveSendingMode);

  const modalContent = SENDING_METHODS_CONFIG.find((config) => config.name === activeSendingMode);

  const { setActiveSendingMode } = useActions();

  if (!modalContent) {
    return null;
  }

  return (
    <Modal
      centered
      open={!!activeSendingMode}
      onCancel={() => setActiveSendingMode(null)}
      footer={null}
      width={780}
    >
      {modalContent.element}
    </Modal>
  );
};

export default SendingModeModal;
