import { FC } from 'react';

import { Button, Flex, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import { useActions, useAppSelector } from 'hooks';
import { selectActiveChat } from 'store/slices/chat.slice';

export type CantSendInChatReason = 'group' | 'inactive-account';

const REASON_TRANSLATION_KEYS: Record<CantSendInChatReason, string> = {
  group: 'CANT_SEND_IN_GROUP',
  'inactive-account': 'CANT_SEND_ACCOUNT_INACTIVE',
};

interface CantSendInChatAlertProps {
  reason?: CantSendInChatReason;
}

const CantSendInChatAlert: FC<CantSendInChatAlertProps> = ({ reason = 'group' }) => {
  const { t } = useTranslation();
  const activeChat = useAppSelector(selectActiveChat);
  const { setActiveChat } = useActions();

  const handleGoToNewChat = () => {
    if (!activeChat?.newChatId) return;

    setActiveChat({
      ...activeChat,
      chatId: activeChat.newChatId,
      newChatId: undefined,
    });
  };

  return (
    <Flex
      vertical
      align="center"
      justify="center"
      gap={12}
      className="chat-form-container text-center p-10"
    >
      <Typography.Paragraph style={{ margin: 'initial' }}>
        {t(REASON_TRANSLATION_KEYS[reason])}
      </Typography.Paragraph>
      {reason === 'inactive-account' && activeChat?.newChatId && (
        <Button type="primary" onClick={handleGoToNewChat}>
          {t('GO_TO_NEW_CHAT')}
        </Button>
      )}
    </Flex>
  );
};

export default CantSendInChatAlert;
