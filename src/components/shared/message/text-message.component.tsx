import { FC, useState, useRef, useEffect } from 'react';

import { Space } from 'antd';
import { useTranslation } from 'react-i18next';

import { MessageProps } from './message.component';
import { useAppSelector } from 'hooks';
import { selectMiniVersion } from 'store/slices/chat.slice';
import { getFormattedMessage, getMessageTypeIcon } from 'utils';

const TextMessage: FC<
  Pick<
    MessageProps['messageDataForRender'],
    'textMessage' | 'typeMessage' | 'downloadUrl' | 'type' | 'jsonMessage'
  > & {
    isCaption?: boolean;
  }
> = ({ textMessage, typeMessage, downloadUrl, type, isCaption }) => {
  const isMiniVersion = useAppSelector(selectMiniVersion);

  const { t } = useTranslation();

  const formattedMessage = getFormattedMessage(textMessage);

  const [expanded, setExpanded] = useState(false);
  const [needsExpansion, setNeedsExpansion] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);

  const toggleExpand = () => setExpanded(!expanded);

  useEffect(() => {
    if (textRef.current) {
      const element = textRef.current;
      const needsExpand = element.scrollHeight > element.clientHeight;
      setNeedsExpansion(needsExpand);
    }
  }, [textMessage, formattedMessage]);

  if (isCaption) {
    return (
      <span>
        <div
          className={`${type === 'outgoing' ? 'outgoing' : 'incoming'} full`}
          style={{
            fontSize: isMiniVersion ? 16 : 14,
            margin: 0,
            width: typeMessage === 'imageMessage' ? 300 : undefined,
            display: '-webkit-box',
            WebkitLineClamp: expanded ? 'unset' : 6,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: '1.5',
          }}
        >
          {formattedMessage}
        </div>
        {!expanded && needsExpansion && (
          <button
            onClick={toggleExpand}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary-color)',
              cursor: 'pointer',
              padding: 0,
              marginTop: 4,
            }}
          >
            {t('SHOW_ALL_TEXT')}
          </button>
        )}
      </span>
    );
  }

  return (
    <Space>
      {getMessageTypeIcon(typeMessage, downloadUrl)}
      <span>
        <div
          ref={textRef}
          className={`${type === 'outgoing' ? 'outgoing' : 'incoming'} ${isMiniVersion ? '' : 'full'}`}
          style={{
            fontSize: isMiniVersion ? 16 : 14,
            margin: 0,
            display: '-webkit-box',
            WebkitLineClamp: expanded ? 'unset' : 6,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: '1.5',
          }}
        >
          {typeMessage === 'templateButtonsReplyMessage' && (
            <span>
              <em>Button reply:</em>
              <br />
            </span>
          )}
          {formattedMessage}
        </div>
        {!expanded && needsExpansion && (
          <button
            onClick={toggleExpand}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary-color)',
              cursor: 'pointer',
              padding: 0,
              marginTop: 4,
            }}
          >
            {t('SHOW_ALL_TEXT')}
          </button>
        )}
      </span>
    </Space>
  );
};

export default TextMessage;
