import { useEffect } from 'react';

import { CloseOutlined } from '@ant-design/icons';
import { Flex, Image } from 'antd';

import { useActions, useAppSelector } from 'hooks';
import { useIsMaxInstance } from 'hooks/use-is-max-instance';
import { useIsTelegramInstance } from 'hooks/use-is-telegram-instance';
import { selectActiveChat, selectReplyMessage } from 'store/slices/chat.slice';
import { getFormattedMessage } from 'utils';

export const ReplyMessage = () => {
  const replyMessage = useAppSelector(selectReplyMessage);
  const activeChat = useAppSelector(selectActiveChat);

  const { setReplyMessage } = useActions();

  const isMax = useIsMaxInstance();
  const isTelegram = useIsTelegramInstance();
  const enableMarkdownLinks = isMax || isTelegram;

  useEffect(() => {
    setReplyMessage(null);
  }, [activeChat]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setReplyMessage(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setReplyMessage]);

  if (!replyMessage?.idMessage) {
    return null;
  }

  return (
    <Flex className="replyMessage" justify="space-between">
      <div>
        <Flex gap={12}>
          <p>{replyMessage.senderName}</p>
          <p className="phoneNumber">{replyMessage.phone}</p>
        </Flex>
        <div className="replyMessageText">
          {getFormattedMessage(
            (replyMessage.typeMessage === 'imageMessage'
              ? replyMessage.caption
              : replyMessage.textMessage) || '',
            { enableMarkdownLinks, compact: true }
          )}
        </div>
      </div>
      <Flex gap={8}>
        {replyMessage.downloadUrl && <Image src={replyMessage.downloadUrl} height={60} />}
        <CloseOutlined className="close" onClick={() => setReplyMessage(null)} />
      </Flex>
    </Flex>
  );
};
