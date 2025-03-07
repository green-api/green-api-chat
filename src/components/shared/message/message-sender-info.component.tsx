import { FC } from 'react';

import { Space } from 'antd';

import { MessageProps } from './message.component';

const MessageSenderInfo: FC<Pick<MessageProps['messageDataForRender'], 'phone' | 'senderName'>> = ({
  senderName,
  phone,
}) => {
  return (
    <Space>
      <h4 className="text-overflow message-signerData" style={{ maxWidth: 205 }} title={senderName}>
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
