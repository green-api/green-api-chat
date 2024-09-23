import { FC } from 'react';

import { Space, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import MessageTooltip from './message-tooltip.component';
import { useAppSelector } from 'hooks';
import { selectMiniVersion } from 'store/slices/chat.slice';
import { QuotedMessageInterface, TypeConnectionMessage } from 'types';
import {
  getJSONMessage,
  getMessageTypeIcon,
  getPhoneNumberFromChatId,
  getTextMessage,
} from 'utils';

interface QuotedMessageProps {
  quotedMessage: QuotedMessageInterface;
  type: TypeConnectionMessage;
}

const QuotedMessage: FC<QuotedMessageProps> = ({ quotedMessage, type }) => {
  const { typeMessage, downloadUrl } = quotedMessage;

  const { i18n } = useTranslation();

  const isMiniVersion = useAppSelector(selectMiniVersion);

  const textMessage = getTextMessage(quotedMessage);
  const jsonMessage = getJSONMessage(quotedMessage);
  const participant = getPhoneNumberFromChatId(quotedMessage.participant);

  const dir = i18n.dir();

  return (
    <MessageTooltip jsonMessage={jsonMessage} isQuotedMessage>
      <Space
        direction="vertical"
        className={`quoted-message ${isMiniVersion ? '' : 'full'} ${type === 'outgoing' ? 'outgoing' : 'incoming'} ${dir === 'rtl' ? 'rtl' : ''}`}
      >
        <h5 className="text-overflow">{participant}</h5>
        <Space>
          {getMessageTypeIcon(typeMessage, downloadUrl)}
          <Typography.Paragraph
            style={{ fontSize: 12, margin: 0, color: 'inherit' }}
            ellipsis={{ rows: 2, expandable: false }}
          >
            {textMessage}
          </Typography.Paragraph>
        </Space>
      </Space>
    </MessageTooltip>
  );
};

export default QuotedMessage;
