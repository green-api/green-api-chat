import { FC } from 'react';

import { Button, Flex, message, Space, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import { MessageProps } from './message.component';
import { useAppDispatch, useAppSelector } from 'hooks';
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

  const dispatch = useAppDispatch();

  const { t } = useTranslation();

  const [downloadFile, { isLoading }] = useDownloadFileMutation();

  const formattedMessage = getFormattedMessage(textMessage);

  const { idMessage, chatId } = JSON.parse(jsonMessage ?? '{}');

  const handleDownloadFile = async () => {
    try {
      const res = await downloadFile({
        chatId,
        idMessage,
        ...selectedInstance,
      }).unwrap();
      console.log(res);

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
    <Flex vertical gap={8}>
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
      {typeMessage === 'imageMessage' && (
        <Button loading={isLoading} onClick={handleDownloadFile}>
          {t('DOWNLOAD')}
        </Button>
      )}
    </Flex>
  );
};

export default TextMessage;
