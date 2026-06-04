import { FC } from 'react';

import { Space } from 'antd';
import { useTranslation } from 'react-i18next';

import { MessageProps } from './message.component';

type MessageSenderInfoProps = Pick<
  MessageProps['messageDataForRender'],
  'phone' | 'senderName' | 'senderType'
> & {
  style?: React.CSSProperties;
};

const MessageSenderInfo: FC<MessageSenderInfoProps> = ({ senderName, senderType, phone, style }) => {
  const { t } = useTranslation();

  return (
    <Space align="center" size={10} className="message-sender-row">
      <div className="message-sender-row__main">
        <h4
          className="text-overflow message-signerData"
          style={{ maxWidth: 205, marginBottom: 0, lineHeight: 1, ...style }}
          title={senderName}
        >
          {senderName}
        </h4>
        {senderType === 'bot' && (
          <span className="message-sender-row__type">
            {t('BOT_LABEL')}
          </span>
        )}
      </div>
      {phone && (
        <div className="message-signerData message-sender-row__phone">
          {phone}
        </div>
      )}
    </Space>
  );
};

export default MessageSenderInfo;
