import { CloseOutlined } from '@ant-design/icons';

import { useActions } from 'hooks';

export const CloseStatus = () => {
  const { setUserSideActiveMode, setIsSendingStatus } = useActions();
  return (
    <CloseOutlined
      style={{ position: 'absolute', top: 20, left: 20, cursor: 'pointer' }}
      onClick={() => {
        setUserSideActiveMode('chats');
        setIsSendingStatus(null);
      }}
    />
  );
};
