import { FC, useEffect, useRef } from 'react';

import { Space } from 'antd';
import { useTranslation } from 'react-i18next';

import FileMessage from './file-message.component';
import MessageSenderInfo from './message-sender-info.component';
import MessageTooltip from './message-tooltip.component';
import QuotedMessage from './quoted-message.component';
import TemplateMessage from './template-message/template-message.component';
import TextMessage from './text-message.component';
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
import { getMessageDate, getOutgoingStatusMessageIcon, isSafari } from 'utils';

export interface MessageProps {
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
  caption?: string;
  fileName?: string;
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
  caption,
  fileName,
}) => {
  const isMiniVersion = useAppSelector(selectMiniVersion);

  const {
    i18n: { resolvedLanguage },
  } = useTranslation();

  const messageDate = getMessageDate(timestamp * 1000, resolvedLanguage as LanguageLiteral, 'long');

  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = messageRef.current;
    if (isLastMessage && element && !isMiniVersion && !isSafari()) {
      element.scrollIntoView();
    }
  }, [isLastMessage]);

  let messageBody = (
    <TextMessage
      textMessage={textMessage}
      typeMessage={typeMessage}
      downloadUrl={downloadUrl}
      type={type}
    />
  );

  if (templateMessage) {
    messageBody = <TemplateMessage templateMessage={templateMessage} type={type} />;
  }

  if (downloadUrl && typeMessage !== 'stickerMessage' && !isMiniVersion) {
    messageBody = (
      <FileMessage
        fileName={fileName}
        typeMessage={typeMessage}
        type={type}
        downloadUrl={downloadUrl}
      />
    );
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
      {showSenderName && <MessageSenderInfo senderName={senderName} phone={phone} />}
      {quotedMessage && <QuotedMessage quotedMessage={quotedMessage} type={type} />}
      {messageBody}
      {caption && !isMiniVersion && (
        <TextMessage textMessage={caption} typeMessage={typeMessage} type={type} isCaption={true} />
      )}
      <Space className="message-date">
        <MessageTooltip jsonMessage={jsonMessage} />
        <span style={{ fontSize: 14 }}>{messageDate}</span>
        {getOutgoingStatusMessageIcon(statusMessage)}
      </Space>
    </div>
  );
};

export default Message;
