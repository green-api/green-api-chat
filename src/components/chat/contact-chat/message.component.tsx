import { FC } from 'react';

import { InfoCircleOutlined } from '@ant-design/icons';
import { Space, Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';

import { LanguageLiteral, TypeConnectionMessage } from 'types';
import { getMessageDate } from 'utils';

interface MessageProps {
  type: TypeConnectionMessage;
  textMessage: string;
  senderName: string;
  isLastMessage: boolean;
  timestamp: number;
  jsonMessage: string;
}

const Message: FC<MessageProps> = ({ textMessage, type, senderName, timestamp, jsonMessage }) => {
  const {
    i18n: { resolvedLanguage },
  } = useTranslation();

  const messageDate = getMessageDate(timestamp * 1000, resolvedLanguage as LanguageLiteral);

  return (
    <div
      style={{
        alignSelf: type === 'incoming' ? 'flex-start' : 'flex-end',
        display: 'flex',
        flexDirection: 'column',
      }}
      className="message"
    >
      <h4 style={{ alignSelf: type === 'incoming' ? 'flex-start' : 'flex-end' }}>{senderName}</h4>
      <div className={`message-text ${type === 'outgoing' ? 'outgoing' : 'incoming'}`}>
        <p>{textMessage}</p>
        <Space style={{ alignSelf: 'end' }}>
          <Tooltip
            title={<pre style={{ textWrap: 'wrap' }}>{jsonMessage}</pre>}
            overlayStyle={{ maxWidth: 450, lineHeight: 'initial' }}
          >
            <InfoCircleOutlined />
          </Tooltip>
          <span style={{ alignSelf: 'end', fontSize: 14 }}>{messageDate.date}</span>
        </Space>
      </div>
    </div>
  );
};

export default Message;
