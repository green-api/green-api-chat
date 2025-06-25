import { FC, useEffect, useRef, useState } from 'react';

import { Space } from 'antd';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import FileMessage from './file-message.component';
import MessageSenderInfo from './message-sender-info.component';
import MessageTooltip from './message-tooltip/message-tooltip.component';
import QuotedMessage from './quoted-message.component';
import TemplateMessage from './template-message/template-message.component';
import TextMessage from './text-message.component';
import { useAppSelector } from 'hooks';
import { selectMiniVersion } from 'store/slices/chat.slice';
import { LanguageLiteral, MessageDataForRender } from 'types';
import { getMessageDate, getOutgoingStatusMessageIcon, isSafari } from 'utils';

export interface MessageProps {
  messageDataForRender: MessageDataForRender;
  preview?: boolean;
}

const Message: FC<MessageProps> = ({ messageDataForRender, preview }) => {
  const {
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
    interactiveButtonsMessage,
    caption,
    fileName,
    isDeleted,
    isEdited,
  } = messageDataForRender;

  const isMiniVersion = useAppSelector(selectMiniVersion);

  const {
    t,
    i18n: { resolvedLanguage },
  } = useTranslation();

  const messageDate = getMessageDate(timestamp * 1000, 'chat', resolvedLanguage as LanguageLiteral);

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

  if (interactiveButtonsMessage) {
    messageBody = (
      <TemplateMessage interactiveButtonsMessage={interactiveButtonsMessage} type={type} />
    );
  }

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

  const [showDeletedMessage, setShowDeletedMessage] = useState(false);

  return (
    <div
      ref={messageRef}
      style={{
        maxWidth: isMiniVersion ? 'unset' : 500,
      }}
      className={clsx(
        'message',
        type === 'outgoing' ? 'outgoing' : 'incoming',
        type === 'outgoing' && !isMiniVersion && 'full',
        !interactiveButtonsMessage && 'p-10'
      )}
    >
      {showSenderName && <MessageSenderInfo senderName={senderName} phone={phone} />}
      {!isDeleted && quotedMessage && (
        <QuotedMessage
          messageDataForRender={messageDataForRender}
          quotedMessage={quotedMessage}
          type={type}
        />
      )}
      {isDeleted && !showDeletedMessage ? (
        <Space>
          <i className="deleted-message">{t('DELETED_MESSAGE')}</i>
          <a style={{ fontStyle: 'normal' }} onClick={() => setShowDeletedMessage(true)}>
            ({t('SHOW')})
          </a>
        </Space>
      ) : (
        messageBody
      )}
      {!isDeleted && caption && !isMiniVersion && (
        <TextMessage textMessage={caption} typeMessage={typeMessage} type={type} isCaption={true} />
      )}
      <Space className="message-date">
        {!preview && (
          <MessageTooltip messageDataForRender={messageDataForRender} jsonMessage={jsonMessage} />
        )}
        {isEdited && <i style={{ alignSelf: 'end', fontSize: 13 }}>{t('EDITED')}</i>}
        <span style={{ fontSize: 13 }}>{messageDate}</span>
        {getOutgoingStatusMessageIcon(statusMessage)}
      </Space>
    </div>
  );
};

export default Message;
