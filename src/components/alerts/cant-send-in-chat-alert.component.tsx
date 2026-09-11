import { FC } from 'react';

import { Flex, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

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

  return (
    <Flex align="center" justify="center" className="chat-form-container text-center p-10">
      <Typography.Paragraph style={{ margin: 'initial' }}>
        {t(REASON_TRANSLATION_KEYS[reason])}
      </Typography.Paragraph>
    </Flex>
  );
};

export default CantSendInChatAlert;
