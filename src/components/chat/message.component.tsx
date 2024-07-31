import { FC, useEffect, useRef } from 'react';

import { useTranslation } from 'react-i18next';

import { getMessageDate } from '../../utils';
import { LanguageLiteral, TypeConnectionMessage } from 'types';

interface MessageProps {
  type: TypeConnectionMessage;
  textMessage: string;
  senderName: string;
  isLastMessage: boolean;
  timestamp: number;
}

const Message: FC<MessageProps> = ({ textMessage, type, senderName, isLastMessage, timestamp }) => {
  const {
    i18n: { resolvedLanguage },
  } = useTranslation();

  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLastMessage && messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isLastMessage]);

  const messageDate = getMessageDate(timestamp * 1000, resolvedLanguage as LanguageLiteral);

  return (
    <div
      style={{
        alignSelf: type === 'incoming' ? 'flex-start' : 'flex-end',
        display: 'flex',
        flexDirection: 'column',
      }}
      ref={messageRef}
      className="message"
    >
      <h4 style={{ alignSelf: type === 'incoming' ? 'flex-start' : 'flex-end' }}>{senderName}</h4>
      <div className={`message-text ${type === 'outgoing' ? 'outgoing' : 'incoming'}`}>
        <p>{textMessage}</p>
        <span style={{ alignSelf: 'end', fontSize: 14 }}>{messageDate.date}</span>
      </div>
    </div>
  );
};

export default Message;
