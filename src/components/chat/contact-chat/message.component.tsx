import { FC } from 'react';

import {
  AudioOutlined,
  CopyOutlined,
  DownOutlined,
  FileImageOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { Flex, Space, Tooltip, Typography } from 'antd';
import useMessage from 'antd/es/message/useMessage';
import { useTranslation } from 'react-i18next';

import DoubleTickIcon from 'assets/double-tick.svg?react';
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
  statusMessage?: StatusMessage;
  downloadUrl?: string;
  showSenderName: boolean;
  phone?: string;
}

const Message: FC<MessageProps> = ({
  textMessage,
  type,
  senderName,
  showSenderName,
  timestamp,
  jsonMessage,
  typeMessage,
  downloadUrl,
  statusMessage,
  phone,
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
        return <DoubleTickIcon style={{ color: 'var(--light-primary-color)' }} />;

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
      <div className={`message-text ${type === 'outgoing' ? 'outgoing' : 'incoming'} p-10`}>
        {showSenderName && (
          <Flex>
            <h4
              style={{ alignSelf: type === 'incoming' ? 'flex-start' : 'flex-end' }}
              className="text-overflow message-signerData"
            >
              {senderName}
            </h4>
            {phone && (
              <div
                className="message-signerData"
                style={{ marginLeft: senderName ? 5 : undefined }}
              >
                {phone}
              </div>
            )}
          </Flex>
        )}
        <Space>
          {getMessageTypeIcon()}
          <Typography.Paragraph
            className={`${type === 'outgoing' ? 'outgoing' : 'incoming'}`}
            style={{ fontSize: 16, margin: 0 }}
            ellipsis={{ rows: 5, expandable: true, symbol: t('SHOW_ALL_TEXT') }}
          >
            {textMessage}
          </Typography.Paragraph>
        </Space>

        <Space style={{ alignSelf: type === 'incoming' ? 'start' : 'end' }}>
          <Tooltip
            overlayInnerStyle={{ background: 'var(--main-background)', color: '#000' }}
            trigger={window.innerWidth < 768 || 'cordova' in window ? 'focus' : 'hover'}
            title={
              <Flex vertical={true}>
                <pre style={{ textWrap: 'wrap' }}>{jsonMessage}</pre>
                <div
                  className="copy-massage-code-button"
                  onClick={() =>
                    navigator.clipboard.writeText(jsonMessage).then(() => {
                      message.open({
                        type: 'success',
                        content: t('TEXT_WAS_COPIED'),
                      });
                    })
                  }
                >
                  <CopyOutlined />
                </div>
              </Flex>
            }
            overlayStyle={{ maxWidth: 450, lineHeight: 'initial', fontSize: 13 }}
          >
            <DownOutlined
              onClick={(event) => {
                event.stopPropagation();
              }}
              className="message-arrow"
              style={{ marginTop: 6 }}
            />
            {contextMessageHolder}
          </Tooltip>
          <span style={{ fontSize: 14 }}>{messageDate.date}</span>
          {statusMessage && getOutgoingStatusMessageIcon()}
        </Space>
      </div>
    </div>
  );
};

export default Message;
