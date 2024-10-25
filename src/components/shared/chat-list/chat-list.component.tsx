import { FC, useEffect, useRef, useState } from 'react';

import { Empty, Flex, List, Spin } from 'antd';
import { useTranslation } from 'react-i18next';

import ChatListItem from './chat-list-item.component';
import { useAppSelector, useMediaQuery } from 'hooks';
import { useLastMessagesQuery } from 'services/green-api/endpoints';
import { selectMiniVersion } from 'store/slices/chat.slice';
import { selectInstance } from 'store/slices/instances.slice';
import { MessageInterface } from 'types';
import { getErrorMessage } from 'utils';

const ChatList: FC = () => {
  const instanceCredentials = useAppSelector(selectInstance);
  const isMiniVersion = useAppSelector(selectMiniVersion);

  const matchMedia = useMediaQuery('(min-height: 1200px)');

  const { t } = useTranslation();

  const { data, isLoading, error } = useLastMessagesQuery(
    {
      idInstance: instanceCredentials.idInstance,
      apiTokenInstance: instanceCredentials.apiTokenInstance,
    },
    {
      skipPollingIfUnfocused: true,
      pollingInterval: isMiniVersion ? 17000 : 15000,
      skip: !instanceCredentials.idInstance || !instanceCredentials.apiTokenInstance,
    }
  );

  const chatListRef = useRef<HTMLDivElement | null>(null);

  const [chatList, setChatList] = useState<MessageInterface[]>([]);

  const limit = isMiniVersion ? 5 : matchMedia ? 16 : 12;
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (isLoading) return;

    if (data) {
      const bufferChats: MessageInterface[] = [];

      for (let i = 0; i < data.length; i++) {
        if (i === page * limit) {
          break;
        }

        bufferChats.push(data[i]);
      }

      setChatList(bufferChats);
    }
  }, [data, page]);

  // scroll bottom handler
  useEffect(() => {
    const element = chatListRef.current;
    if (!element) {
      return;
    }

    let setPageTimer: number;

    const handleScrollBottom = () => {
      if (
        element.scrollTop + element.offsetHeight + 50 >= element.scrollHeight &&
        data &&
        data.length > page * limit
      ) {
        clearTimeout(setPageTimer);

        setPageTimer = setTimeout(() => {
          setPage((prev) => prev + 1);
        }, 500);
      }
    };

    element.addEventListener('scroll', handleScrollBottom);

    return () => element.removeEventListener('scroll', handleScrollBottom);
  }, [data, page]);

  if (!instanceCredentials.idInstance || !instanceCredentials.apiTokenInstance) {
    return (
      <Empty
        className={`empty p-10 ${isMiniVersion ? 'min-height-460' : 'height-720'}`}
        description={t('SELECT_INSTANCE_PLACEHOLDER')}
      />
    );
  }

  if (error) {
    if ('status' in error && error.status === 429) {
      return (
        <Flex
          className={`contact-list ${isMiniVersion ? 'min-height-460' : 'height-720'}`}
          align="center"
          justify="center"
        >
          <Spin size="large" />
        </Flex>
      );
    }

    return (
      <Empty
        className={`empty p-10 ${isMiniVersion ? 'min-height-460' : 'height-720'}`}
        description={getErrorMessage(error, t)}
      />
    );
  }

  return (
    <List
      ref={chatListRef}
      itemLayout="horizontal"
      className={`contact-list ${isMiniVersion ? 'min-height-460' : 'height-720'}`}
      dataSource={chatList}
      renderItem={(message) => <ChatListItem key={message.chatId} lastMessage={message} />}
      loading={{
        spinning: isLoading,
        className: `${isMiniVersion ? 'min-height-460' : 'height-720'}`,
        size: 'large',
      }}
      locale={{
        emptyText: <Empty className="empty p-10" description={t('EMPTY_CHAT_LIST')} />,
      }}
    />
  );
};

export default ChatList;
