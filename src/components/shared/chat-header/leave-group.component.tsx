import { FC } from 'react';

import { Button, message, Popconfirm } from 'antd';
import { useTranslation } from 'react-i18next';

import { useActions, useAppSelector } from 'hooks';
import { useIsMaxInstance } from 'hooks/use-is-max-instance';
import { useLeaveGroupMutation } from 'services/green-api/endpoints';
import { selectInstance } from 'store/slices/instances.slice';
import { ActiveChat } from 'types';

interface LeaveGroupButtonProps {
  activeChat: ActiveChat;
}

const LeaveGroupButton: FC<LeaveGroupButtonProps> = ({ activeChat }) => {
  const { t } = useTranslation();
  const [leaveGroup] = useLeaveGroupMutation();
  const { setContactInfoOpen } = useActions();
  const instanceCredentials = useAppSelector(selectInstance);

  const isMax = useIsMaxInstance();

  const handleLeaveGroupClick = async () => {
    try {
      const res = await leaveGroup({
        ...(isMax ? { chatId: activeChat.chatId } : { groupId: activeChat.chatId }),
        ...instanceCredentials,
      });
      if (!!res.data?.leaveGroup) {
        message.success(t('LEFT_GROUP_SUCCESS'));
        setContactInfoOpen(false);
      }
      if (!res.data?.leaveGroup) {
        message.error(t('ERROR_LEAVING_GROUP'));
      }
    } catch {
      message.error(t('ERROR_LEAVING_GROUP'));
    }
  };

  if (typeof activeChat.contactInfo === 'string' || !activeChat.contactInfo) return null;
  return (
    <Popconfirm
      title={t('CONFIRM_LEAVE_GROUP')}
      okText={t('YES')}
      cancelText={t('NO')}
      onConfirm={handleLeaveGroupClick}
    >
      <Button type="default" className="delete-button" danger variant="solid">
        {t('LEAVE_GROUP')}
      </Button>
    </Popconfirm>
  );
};

export default LeaveGroupButton;
