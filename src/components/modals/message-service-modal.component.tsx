import { FC, useMemo } from 'react';

import { Modal } from 'antd';

import { MESSAGE_SERVICE_METHODS_CONFIG } from 'configs';
import { useActions, useAppSelector } from 'hooks';
import { selectActiveServiceMethod } from 'store/slices/message-menu.slice';

const MessageServiceModal: FC = () => {
  const activeServiceMethodName = useAppSelector(selectActiveServiceMethod);

  const modalContent = useMemo(
    () => MESSAGE_SERVICE_METHODS_CONFIG.find((config) => config.name === activeServiceMethodName),
    [activeServiceMethodName]
  );

  const { setActiveServiceMethod, setMessageDataForRender } = useActions();

  const reset = () => {
    // setMessageDataForRender(null);
    setActiveServiceMethod(null);
  };

  return (
    <Modal
      centered
      className={activeServiceMethodName === 'editMessage' ? 'edit-message-modal' : undefined}
      open={!!activeServiceMethodName}
      onCancel={reset}
      footer={null}
      width={550}
      destroyOnClose
    >
      {modalContent?.element}
    </Modal>
  );
};

export default MessageServiceModal;
