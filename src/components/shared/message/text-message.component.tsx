import { FC, useState, useRef, useEffect } from 'react';

import { Button, Flex, message, Space } from 'antd';
import { useTranslation } from 'react-i18next';

import { MessageProps } from './message.component';
import { useAppDispatch, useAppSelector } from 'hooks';
import { useIsMaxInstance } from 'hooks/use-is-max-instance';
import { useIsTelegramInstance } from 'hooks/use-is-telegram-instance';
import { useDownloadFileMutation } from 'services/green-api/endpoints';
import { journalsGreenApiEndpoints } from 'services/green-api/endpoints/journals.green-api.endpoints';
import { selectActiveChat, selectMessageCount, selectMiniVersion } from 'store/slices/chat.slice';
import { selectInstance } from 'store/slices/instances.slice';
import { getFormattedMessage, getMessageTypeIcon } from 'utils';

const TextMessage: FC<
  Pick<
    MessageProps['messageDataForRender'],
    'textMessage' | 'typeMessage' | 'downloadUrl' | 'type' | 'jsonMessage'
  > & {
    isCaption?: boolean;
  }
> = ({ textMessage, typeMessage, downloadUrl, type, isCaption, jsonMessage }) => {
  const isMiniVersion = useAppSelector(selectMiniVersion);
  const selectedInstance = useAppSelector(selectInstance);
  const messageCount = useAppSelector(selectMessageCount);
  const activeChat = useAppSelector(selectActiveChat);
  const isMax = useIsMaxInstance();
  const isTelegram = useIsTelegramInstance();
  const enableMarkdownLinks = isMax || isTelegram;

  const dispatch = useAppDispatch();

  const { t } = useTranslation();

  const [downloadFile, { isLoading }] = useDownloadFileMutation();

  const formattedMessage = getFormattedMessage(textMessage, { enableMarkdownLinks });

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

  useEffect(() => {
    const textElement = textRef.current;

    if (!textElement) {
      return;
    }

    const onCodeCopyClick = async (event: globalThis.MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const copyButton = target?.closest('[data-code-copy="true"]') as HTMLElement | null;

      if (!copyButton) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const codeBlock = copyButton.closest('.message-code-block');
      const codeElement = codeBlock?.querySelector('code');
      const codeText = codeElement?.textContent ?? '';

      if (!codeText) {
        return;
      }

      try {
        await navigator.clipboard.writeText(codeText);
        message.success(t('TEXT_WAS_COPIED'));
      } catch {
        message.error(t('UNKNOWN_ERROR'));
      }
    };

    textElement.addEventListener('click', onCodeCopyClick);

    return () => {
      textElement.removeEventListener('click', onCodeCopyClick);
    };
  }, [t, formattedMessage]);

  const { idMessage, chatId } = JSON.parse(jsonMessage ?? '{}');

  const handleDownloadFile = async () => {
    try {
      const res = await downloadFile({
        chatId,
        idMessage,
        ...selectedInstance,
      }).unwrap();

      const updateChatHistoryThunk = journalsGreenApiEndpoints.util?.updateQueryData(
        'getChatHistory',
        {
          ...selectedInstance,
          chatId: activeChat?.chatId ?? chatId,
          count: isMiniVersion ? 10 : messageCount,
        },
        (draftChatHistory) => {
          const existingMessage = draftChatHistory.find((msg) => msg.idMessage === idMessage);

          if (!existingMessage) {
            console.log('message not found in chat history');

            return;
          }

          existingMessage.downloadUrl = res.downloadUrl;

          return draftChatHistory;
        }
      );
      if (updateChatHistoryThunk) {
        dispatch(updateChatHistoryThunk);
      }
    } catch (error) {
      message.error(t('DOWNLOAD_ERROR'));
    }
  };

  if (isCaption) {
    return (
      <span>
        <div
          ref={textRef}
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
            wordBreak: 'break-word',
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
    <Flex vertical gap={8}>
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
              wordBreak: 'break-word',
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
      {typeMessage === 'imageMessage' && !isMiniVersion && (
        <Button loading={isLoading} onClick={handleDownloadFile}>
          {t('DOWNLOAD')}
        </Button>
      )}
    </Flex>
  );
};

export default TextMessage;
