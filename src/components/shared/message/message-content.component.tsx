import React from 'react';

import { Space, Typography } from 'antd';

import { TypeMessage } from 'types';
import { getFormattedMessage, getMessageTypeIcon } from 'utils';

interface MessageContentProps {
  type: 'incoming' | 'outgoing';
  typeMessage: TypeMessage;
  textMessage: string;
  downloadUrl?: string;
  isMiniVersion?: boolean;
  t: (key: string) => string;
}

const MessageContent: React.FC<MessageContentProps> = ({
  type,
  typeMessage,
  textMessage,
  downloadUrl,
  isMiniVersion = false,
  t,
}) => {
  const formattedMessage = getFormattedMessage(textMessage);

  return (
    <Space>
      {getMessageTypeIcon(typeMessage, downloadUrl)}
      <span>
        <Typography.Paragraph
          className={`${type === 'outgoing' ? 'outgoing' : 'incoming'} ${isMiniVersion ? '' : 'full'}`}
          style={{ fontSize: isMiniVersion ? 16 : 14, margin: 0 }}
          ellipsis={{ rows: 6, expandable: true, symbol: t('SHOW_ALL_TEXT') }}
        >
          {typeMessage === 'templateButtonsReplyMessage' && (
            <span>
              <em>Button reply:</em>
              <br />
            </span>
          )}
          {formattedMessage}
        </Typography.Paragraph>
      </span>
    </Space>
  );
};

export default MessageContent;
