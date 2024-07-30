import { FC } from 'react';

import { TypeConnectionMessage } from 'types';

interface MessageProps {
  type: TypeConnectionMessage;
  textMessage: string;
  senderName: string;
}

const Message: FC<MessageProps> = ({ textMessage, type, senderName }) => {
  return (
    <div
      style={{
        alignSelf: type === 'incoming' ? 'flex-start' : 'flex-end',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <h4 style={{ alignSelf: type === 'incoming' ? 'flex-start' : 'flex-end' }}>{senderName}</h4>
      <p>{textMessage}</p>
    </div>
  );
};

export default Message;
