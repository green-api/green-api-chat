import { FC, useEffect, useRef } from 'react';

import { Image, Space, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import MessageTooltip from './message-tooltip.component';
import QuotedMessage from './quoted-message.component';
import TemplateMessage from './template-message/template-message.component';
import { useAppSelector } from 'hooks';
import { selectMiniVersion } from 'store/slices/chat.slice';
import {
  LanguageLiteral,
  ParsedWabaTemplateInterface,
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
  id?: string;
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
  templateMessage?: ParsedWabaTemplateInterface;
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
  templateMessage,
  id,
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

  let messageBody = (
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
  );

  if (templateMessage) {
    messageBody = <TemplateMessage templateMessage={templateMessage} type={type} />;
  }

  if (downloadUrl && typeMessage === 'imageMessage' && !isMiniVersion) {
    messageBody = <Image width={300} src={downloadUrl} loading="lazy" alt="media" />;
  }

  return (
    <div
      ref={messageRef}
      id={id}
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
      {messageBody}
      <Space className="message-date">
        <MessageTooltip jsonMessage={jsonMessage} />
        <span style={{ fontSize: 14 }}>{messageDate}</span>
        {getOutgoingStatusMessageIcon(statusMessage)}
      </Space>
    </div>
  );
};

export default Message;
