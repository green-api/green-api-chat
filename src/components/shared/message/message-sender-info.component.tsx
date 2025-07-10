import { FC } from 'react';

import { Space } from 'antd';

import { MessageProps } from './message.component';

type MessageSenderInfoProps = Pick<MessageProps['messageDataForRender'], 'phone' | 'senderName'> & {
  style?: React.CSSProperties;
};

const MessageSenderInfo: FC<MessageSenderInfoProps> = ({ senderName, phone, style }) => {
  return (
    <Space>
      <h4
        className="text-overflow message-signerData"
        style={{ maxWidth: 205, ...style }}
        title={senderName}
      >
        {senderName}
      </h4>
      {phone && (
        <div className="message-signerData" style={{ marginLeft: senderName ? 5 : undefined }}>
          {phone}
        </div>
      )}
    </Space>
  );
};

export default MessageSenderInfo;
