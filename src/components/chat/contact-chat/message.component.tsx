import { FC } from 'react';

import { AudioOutlined, FileImageOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { Space, Tooltip, Typography } from 'antd';
import useMessage from 'antd/es/message/useMessage';
import { useTranslation } from 'react-i18next';

import DoubleTickIcon from 'assets/double-tick.svg?react';
import InfoIcon from 'assets/info.svg?react';
import TickIcon from 'assets/tick.svg?react';
import { LanguageLiteral, StatusMessage, TypeConnectionMessage, TypeMessage } from 'types';
import { getMessageDate } from 'utils';

interface MessageProps {
  type: TypeConnectionMessage;
  typeMessage: TypeMessage;
  textMessage: string;
  senderName: string;
  isLastMessage: boolean;
  timestamp: number;
  jsonMessage: string;
  idMessage: string;
  statusMessage?: StatusMessage;
  downloadUrl?: string;
}

const Message: FC<MessageProps> = ({
  textMessage,
  type,
  senderName,
  timestamp,
  jsonMessage,
  idMessage,
  typeMessage,
  downloadUrl,
  statusMessage,
}) => {
  const {
    t,
    i18n: { resolvedLanguage },
  } = useTranslation();

  const messageDate = getMessageDate(timestamp * 1000, resolvedLanguage as LanguageLiteral);

  const [message, contextMessageHolder] = useMessage();

  const getMessageTypeIcon = () => {
    if (!downloadUrl) {
      return null;
    }

    let messageTypeIcon: JSX.Element | null = null;

    switch (typeMessage) {
      case 'imageMessage':
        messageTypeIcon = <FileImageOutlined />;
        break;

      case 'audioMessage':
        messageTypeIcon = <AudioOutlined />;
        break;

      case 'videoMessage':
        messageTypeIcon = <VideoCameraOutlined />;
        break;

      default:
        break;
    }

    if (!messageTypeIcon) {
      return null;
    }

    return (
      <a href={downloadUrl} target="_blank" rel="noreferrer">
        {messageTypeIcon}
      </a>
    );
  };

  const getOutgoingStatusMessageIcon = () => {
    if (!statusMessage) {
      return null;
    }

    switch (statusMessage) {
      case 'sent':
        return <TickIcon style={{ color: '#8696a0' }} />;

      case 'delivered':
        return <DoubleTickIcon style={{ color: '#8696a0' }} />;

      case 'read':
        return <DoubleTickIcon style={{ color: '#42ff00' }} />;

      default:
        return null;
    }
  };

  return (
    <div
      style={{
        alignSelf: type === 'incoming' ? 'flex-start' : 'flex-end',
      }}
      className="message"
    >
      <h4
        style={{ alignSelf: type === 'incoming' ? 'flex-start' : 'flex-end' }}
        className="text-overflow"
      >
        {senderName}
      </h4>
      <div className={`message-text ${type === 'outgoing' ? 'outgoing' : 'incoming'} p-10`}>
        <Space>
          {getMessageTypeIcon()}
          <Typography.Paragraph
            className={`${type === 'outgoing' ? 'outgoing' : 'incoming'}`}
            style={{ fontSize: 16 }}
            ellipsis={{ rows: 5, expandable: true, symbol: t('SHOW_ALL_TEXT') }}
          >
            {textMessage}
          </Typography.Paragraph>
        </Space>

        <Space style={{ alignSelf: 'end' }}>
          <Tooltip
            title={<pre style={{ textWrap: 'wrap' }}>{jsonMessage}</pre>}
            overlayStyle={{ maxWidth: 450, lineHeight: 'initial', fontSize: 13 }}
          >
            <InfoIcon
              onClick={(event) => {
                event.stopPropagation();

                navigator.clipboard.writeText(idMessage).then(() => {
                  message.open({
                    type: 'success',
                    content: t('TEXT_WAS_COPIED'),
                  });
                });
              }}
              style={{ marginTop: 6 }}
            />
            {contextMessageHolder}
          </Tooltip>
          <span style={{ alignSelf: 'end', fontSize: 14 }}>{messageDate.date}</span>
          {statusMessage && getOutgoingStatusMessageIcon()}
        </Space>
      </div>
    </div>
  );
};

export default Message;
