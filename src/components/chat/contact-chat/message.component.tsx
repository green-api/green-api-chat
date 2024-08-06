import { FC } from 'react';

import {
  AudioOutlined,
  FileImageOutlined,
  InfoCircleOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { Space, Tooltip } from 'antd';
import useMessage from 'antd/es/message/useMessage';
import { useTranslation } from 'react-i18next';

import { LanguageLiteral, TypeConnectionMessage, TypeMessage } from 'types';
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
}) => {
  const {
    t,
    i18n: { resolvedLanguage },
  } = useTranslation();

  const messageDate = getMessageDate(timestamp * 1000, resolvedLanguage as LanguageLiteral);

  const [message, contextMessageHolder] = useMessage();

  const getMessageTypeIcon = (typeMessage: TypeMessage, downloadUrl?: string) => {
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
        <Space>
          {getMessageTypeIcon(typeMessage, downloadUrl)}
          <p>{textMessage}</p>
        </Space>

        <Space style={{ alignSelf: 'end' }}>
          <Tooltip
            title={<pre style={{ textWrap: 'wrap' }}>{jsonMessage}</pre>}
            overlayStyle={{ maxWidth: 450, lineHeight: 'initial' }}
          >
            <InfoCircleOutlined
              onClick={(event) => {
                event.stopPropagation();

                navigator.clipboard.writeText(idMessage).then(() => {
                  message.open({
                    type: 'success',
                    content: t('TEXT_WAS_COPIED'),
                  });
                });
              }}
            />
            {contextMessageHolder}
          </Tooltip>
          <span style={{ alignSelf: 'end', fontSize: 14 }}>{messageDate.date}</span>
        </Space>
      </div>
    </div>
  );
};

export default Message;
