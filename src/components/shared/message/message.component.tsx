import { FC, useEffect, useRef } from 'react';

import { Space, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import MessageTooltip from './message-tooltip.component';
import QuotedMessage from './quoted-message.component';
import { useAppSelector } from 'hooks';
import { selectMiniVersion } from 'store/slices/chat.slice';
import {
  LanguageLiteral,
  QuotedMessageInterface,
  StatusMessage,
  TypeConnectionMessage,
  TypeMessage,
} from 'types';
import {
  getFormattedMessage,
  getMessageDate,
  getMessageTypeIcon,
  getOutgoingStatusMessageIcon,
  isSafari,
} from 'utils';

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
  quotedMessage?: QuotedMessageInterface;
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
  isLastMessage,
  quotedMessage,
}) => {
  const isMiniVersion = useAppSelector(selectMiniVersion);

  const {
    t,
    i18n: { resolvedLanguage },
  } = useTranslation();

  const messageDate = getMessageDate(timestamp * 1000, resolvedLanguage as LanguageLiteral, 'long');

  const messageRef = useRef<HTMLDivElement>(null);

  const formattedMessage = getFormattedMessage(textMessage);

  useEffect(() => {
    const element = messageRef.current;
    if (isLastMessage && element && !isMiniVersion && !isSafari()) {
      element.scrollIntoView();
    }
  }, [isLastMessage]);

  return (
    <div
      ref={messageRef}
      style={{
        maxWidth: isMiniVersion ? 'unset' : 500,
      }}
      className={`message ${type === 'outgoing' ? `outgoing ${isMiniVersion ? '' : 'full'}` : 'incoming'} p-10`}
    >
      {showSenderName && (
        <Space>
          <h4
            className="text-overflow message-signerData"
            style={{ maxWidth: 205 }}
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
      )}
      {quotedMessage && <QuotedMessage quotedMessage={quotedMessage} type={type} />}
      <Space>
        {getMessageTypeIcon(typeMessage, downloadUrl)}
        <Typography.Paragraph
          className={`${type === 'outgoing' ? 'outgoing' : 'incoming'} ${isMiniVersion ? '' : 'full'}`}
          style={{ fontSize: isMiniVersion ? 16 : 14, margin: 0 }}
          ellipsis={{ rows: 6, expandable: true, symbol: t('SHOW_ALL_TEXT') }}
        >
          {typeMessage === 'templateButtonsReplyMessage' && (
            <>
              <em>Button reply:</em>
              <br />
            </>
          )}
          {formattedMessage}
        </Typography.Paragraph>
      </Space>
      <Space style={{ alignSelf: 'end' }}>
        <MessageTooltip jsonMessage={jsonMessage} />
        <span style={{ fontSize: 14 }}>{messageDate.date}</span>
        {getOutgoingStatusMessageIcon(statusMessage)}
      </Space>
    </div>
  );
};

export default Message;
