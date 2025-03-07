import { FC } from 'react';

import { Space, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import { MessageProps } from './message.component';
import { useAppSelector } from 'hooks';
import { selectMiniVersion } from 'store/slices/chat.slice';
import { getFormattedMessage, getMessageTypeIcon } from 'utils';

const TextMessage: FC<
  Pick<
    MessageProps['messageDataForRender'],
    'textMessage' | 'typeMessage' | 'downloadUrl' | 'type'
  > & {
    isCaption?: boolean;
  }
> = ({ textMessage, typeMessage, downloadUrl, type, isCaption }) => {
  const isMiniVersion = useAppSelector(selectMiniVersion);

  const { t } = useTranslation();

  const formattedMessage = getFormattedMessage(textMessage);

  if (isCaption) {
    return (
      <Typography.Paragraph
        className={`${type === 'outgoing' ? 'outgoing' : 'incoming'} full`}
        style={{
          fontSize: isMiniVersion ? 16 : 14,
          margin: 0,
          width: typeMessage === 'imageMessage' ? 300 : undefined,
        }}
        ellipsis={{ rows: 6, expandable: true, symbol: t('SHOW_ALL_TEXT') }}
      >
        {formattedMessage}
      </Typography.Paragraph>
    );
  }

  return (
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
};

export default TextMessage;
