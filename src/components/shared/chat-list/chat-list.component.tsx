import { FC, useEffect, useMemo, useRef, useState } from 'react';

import { Empty, Flex, List, Skeleton, Spin, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import ChatListItem from './chat-list-item.component';
import ChatSearchInput from './chat-search-input.component';
import { useAppSelector, useMediaQuery } from 'hooks';
import { useGetChatsQuery, useLazyGetChatHistoryQuery } from 'services/green-api/endpoints';
import { selectMiniVersion, selectSearchQuery, selectType } from 'store/slices/chat.slice';
import { selectInstance } from 'store/slices/instances.slice';
import { GetChatsResponseInterface, MessageInterface } from 'types';
import {
  filterMessagesByText,
  getCachedGetChatHistoryMessages,
  getErrorMessage,
  updateAllChats,
} from 'utils';

const { Title } = Typography;
const CHATS_BATCH_SIZE = 100;
const SKELETON_ITEMS_COUNT = 8;

const isNotReaction = (msg: MessageInterface) => {
  if (msg.typeMessage === 'reactionMessage') {
    return false;
  }
  if ('reactionText' in msg || 'reaction' in msg) {
    return false;
  }
  return true;
};

const chatToMessage = (chat: GetChatsResponseInterface): MessageInterface => ({
  chatId: chat.chatId,
  chatType: chat.type,
  idMessage: `chat-${chat.chatId}`,
  senderName: chat.name,
  senderContactName: chat.name,
  timestamp: 0,
  type: 'incoming',
  typeMessage: 'textMessage',
  textMessage: '',
});

const ChatList: FC = () => {
  const instanceCredentials = useAppSelector(selectInstance);
  const isMiniVersion = useAppSelector(selectMiniVersion);
  const searchQuery = useAppSelector(selectSearchQuery);
  const greenApiQueries = useAppSelector((state) => state.greenAPI.queries);
  const type = useAppSelector(selectType);

  const matchMedia = useMediaQuery('(min-height: 1200px)');

  const { t } = useTranslation();

  const [contactNames, setContactNames] = useState<Record<string, string>>({});
  const [lastMessagesByChatId, setLastMessagesByChatId] = useState<
    Record<string, MessageInterface>
  >({});
  const [emptyHistoryChatIds, setEmptyHistoryChatIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [contactsPage, setContactsPage] = useState(1);
  const [messagesPage, setMessagesPage] = useState(1);
  const [chatsCount, setChatsCount] = useState(CHATS_BATCH_SIZE);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  const [initialMessageIds, setInitialMessageIds] = useState<Set<string>>(new Set());
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  const {
    data: chats = [],
    isLoading,
    isFetching,
    error,
    fulfilledTimeStamp: chatsFulfilledTimeStamp,
  } = useGetChatsQuery(
    { ...instanceCredentials, count: chatsCount },
    {
      skipPollingIfUnfocused: true,
      pollingInterval: isMiniVersion ? 17000 : 15000,
      skip: !instanceCredentials?.idInstance || !instanceCredentials.apiTokenInstance,
    }
  );
  const [getChatHistory] = useLazyGetChatHistoryQuery();

  const chatListRef = useRef<HTMLDivElement | null>(null);
  const pendingHistoryChatIdsRef = useRef<Set<string>>(new Set());
  const lastHistoryRefreshTimeStampRef = useRef<number>();

  const limit = isMiniVersion ? 5 : matchMedia ? 16 : 12;

  const handleNameExtracted = (chatId: string, name: string) => {
    setContactNames((prev) => ({
      ...prev,
      [chatId]: name.toLowerCase(),
    }));
  };

  const chatPlaceholders = useMemo(
    () => chats.filter((chat) => !emptyHistoryChatIds.has(chat.chatId)).map(chatToMessage),
    [chats, emptyHistoryChatIds]
  );

  const allMessages: MessageInterface[] = useMemo(
    () =>
      chats.reduce<MessageInterface[]>((result, chat) => {
        const message = lastMessagesByChatId[chat.chatId];

        if (message && isNotReaction(message)) {
          result.push(message);
        } else if (!emptyHistoryChatIds.has(chat.chatId)) {
          result.push(chatToMessage(chat));
        }

        return result;
      }, []),
    [chats, emptyHistoryChatIds, lastMessagesByChatId]
  );

  const cachedGetChatHistoryMessages = useMemo(
    () => getCachedGetChatHistoryMessages(greenApiQueries, instanceCredentials),
    [
      greenApiQueries,
      instanceCredentials.idInstance,
      instanceCredentials.apiTokenInstance,
      instanceCredentials.apiUrl,
    ]
  );

  const searchableMessages = useMemo(
    () => updateAllChats(Object.values(lastMessagesByChatId), cachedGetChatHistoryMessages, []),
    [lastMessagesByChatId, cachedGetChatHistoryMessages]
  );

  const isChatListLoading = isLoading || isFetching || isHistoryLoading;
  const showResults = searchQuery.trim() !== '';

  const filteredContacts = useMemo(() => {
    const query = searchQuery.toLowerCase();

    return chatPlaceholders.filter((chat) => {
      const name = (contactNames[chat.chatId] || chat.senderName || '').toLowerCase();
      const chatId = chat.chatId?.toLowerCase();

      return name.includes(query) || chatId?.includes(query);
    });
  }, [chatPlaceholders, contactNames, searchQuery]);

  const filteredMessages = useMemo(
    () => filterMessagesByText(searchableMessages, searchQuery),
    [searchableMessages, searchQuery]
  );

  const pagedFilteredContacts = filteredContacts.slice(0, contactsPage * limit);
  const pagedFilteredMessages = filteredMessages.slice(0, messagesPage * limit);
  const displayedMessages = showResults
    ? pagedFilteredContacts
    : allMessages.slice(0, page * limit);
  const skeletonItems = useMemo(
    () => Array.from({ length: Math.min(limit, SKELETON_ITEMS_COUNT) }, (_, index) => index),
    [limit]
  );

  useEffect(() => {
    setLastMessagesByChatId({});
    setEmptyHistoryChatIds(new Set());
    pendingHistoryChatIdsRef.current.clear();
    lastHistoryRefreshTimeStampRef.current = undefined;
    setInitialLoaded(false);
    setInitialMessageIds(new Set());
    setUnreadCounts({});
    setPage(1);
    setContactsPage(1);
    setMessagesPage(1);
    setChatsCount(CHATS_BATCH_SIZE);
    setIsHistoryLoading(false);
  }, [
    instanceCredentials.idInstance,
    instanceCredentials.apiTokenInstance,
    instanceCredentials.apiUrl,
  ]);

  useEffect(() => {
    if (!instanceCredentials?.idInstance || !instanceCredentials.apiTokenInstance) return;

    let canceled = false;

    const shouldRefreshChats =
      Boolean(chatsFulfilledTimeStamp) &&
      lastHistoryRefreshTimeStampRef.current !== chatsFulfilledTimeStamp;

    const chatsToLoad = chats.filter(
      (chat) =>
        (shouldRefreshChats ||
          (!lastMessagesByChatId[chat.chatId] && !emptyHistoryChatIds.has(chat.chatId))) &&
        !pendingHistoryChatIdsRef.current.has(chat.chatId)
    );

    if (!chatsToLoad.length) {
      setIsHistoryLoading(false);
      return;
    }

    if (shouldRefreshChats) {
      lastHistoryRefreshTimeStampRef.current = chatsFulfilledTimeStamp;
    }

    setIsHistoryLoading(true);
    chatsToLoad.forEach((chat) => pendingHistoryChatIdsRef.current.add(chat.chatId));

    Promise.all(
      chatsToLoad.map(async (chat) => {
        try {
          const { data: history } = await getChatHistory(
            {
              ...instanceCredentials,
              chatId: chat.chatId,
              count: 1,
            },
          );

          return { chat, message: history?.find(isNotReaction) };
        } finally {
          pendingHistoryChatIdsRef.current.delete(chat.chatId);
        }
      })
    ).then((results) => {
      if (canceled) return;

      setLastMessagesByChatId((prev) => {
        const updated = { ...prev };
        const emptyChatIds = new Set<string>();

        results.forEach(({ chat, message }) => {
          if (message) {
            updated[chat.chatId] = message;
          } else {
            delete updated[chat.chatId];
            emptyChatIds.add(chat.chatId);
          }
        });

        if (emptyChatIds.size) {
          setEmptyHistoryChatIds((current) => {
            const next = new Set(current);
            emptyChatIds.forEach((chatId) => next.add(chatId));
            return next;
          });
        }

        return updated;
      });
      setIsHistoryLoading(false);
    });

    return () => {
      canceled = true;
      chatsToLoad.forEach((chat) => pendingHistoryChatIdsRef.current.delete(chat.chatId));
    };
  }, [
    chats,
    chatsFulfilledTimeStamp,
    emptyHistoryChatIds,
    getChatHistory,
    instanceCredentials,
    lastMessagesByChatId,
  ]);

  useEffect(() => {
    const loadedMessages = Object.values(lastMessagesByChatId).filter(isNotReaction);

    if (!initialLoaded && loadedMessages.length > 0) {
      const messageIds = new Set(
        loadedMessages.map((msg) => msg.idMessage || `${msg.chatId}-${msg.timestamp}`)
      );
      setInitialMessageIds(messageIds);
      setInitialLoaded(true);
    }
  }, [lastMessagesByChatId, initialLoaded]);

  useEffect(() => {
    const loadedMessages = Object.values(lastMessagesByChatId).filter(isNotReaction);

    if (!initialLoaded || loadedMessages.length === 0) return;

    const prevIds = initialMessageIds;
    const newIds = new Set(prevIds);

    const newUnreadCounts: Record<string, number> = { ...unreadCounts };

    loadedMessages
      .filter((i) => i.type !== 'outgoing')
      .forEach((msg) => {
        const messageId = msg.idMessage || `${msg.chatId}-${msg.timestamp}`;

        if (!prevIds.has(messageId)) {
          newUnreadCounts[msg.chatId] = (newUnreadCounts[msg.chatId] || 0) + 1;
        }

        newIds.add(messageId);
      });

    setInitialMessageIds(newIds);
    setUnreadCounts(newUnreadCounts);
  }, [lastMessagesByChatId, initialLoaded]);

  const clearUnreadCount = (chatId: string) => {
    setUnreadCounts((prev) => {
      const updated = { ...prev };
      delete updated[chatId];
      return updated;
    });
  };

  useEffect(() => {
    if (!allMessages.length) return;

    setContactNames((prev) => {
      const updated = { ...prev };
      allMessages.forEach((msg) => {
        if (!updated[msg.chatId]) {
          updated[msg.chatId] = (
            msg.senderContactName ||
            msg.senderName ||
            msg.chatId
          ).toLowerCase();
        }
      });
      return updated;
    });
  }, [allMessages]);

  useEffect(() => {
    const element = chatListRef.current;
    if (!element) return;

    let scrollTimer: number;

    const loadMoreChats = () => {
      if (!isFetching && chats.length >= chatsCount) {
        setChatsCount((prev) => prev + CHATS_BATCH_SIZE);
      }
    };

    const handleScrollBottom = () => {
      const bottomReached = element.scrollTop + element.offsetHeight + 50 >= element.scrollHeight;

      if (bottomReached) {
        clearTimeout(scrollTimer);

        if (showResults) {
          let updated = false;

          if (filteredContacts.length > contactsPage * limit) {
            scrollTimer = setTimeout(() => setContactsPage((prev) => prev + 1), 500);
            updated = true;
          }

          if (filteredMessages.length > messagesPage * limit && !updated) {
            scrollTimer = setTimeout(() => setMessagesPage((prev) => prev + 1), 500);
            updated = true;
          }

          if (!updated) {
            scrollTimer = setTimeout(loadMoreChats, 500);
          }
        } else {
          if (allMessages.length > page * limit) {
            scrollTimer = setTimeout(() => setPage((prev) => prev + 1), 500);
          } else {
            scrollTimer = setTimeout(loadMoreChats, 500);
          }
        }
      }
    };

    element.addEventListener('scroll', handleScrollBottom);
    return () => {
      clearTimeout(scrollTimer);
      element.removeEventListener('scroll', handleScrollBottom);
    };
  }, [
    chats.length,
    chatsCount,
    filteredContacts,
    filteredMessages,
    allMessages,
    contactsPage,
    isFetching,
    messagesPage,
    page,
    showResults,
  ]);

  if (!instanceCredentials?.idInstance || !instanceCredentials.apiTokenInstance) {
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
    <>
      {type !== 'mobile-mode' && <ChatSearchInput setPage={setPage} />}

      <div
        ref={chatListRef}
        className={`contact-list px-2 overflow-auto ${isMiniVersion ? 'min-height-460' : 'height-720'}`}
      >
        {isChatListLoading ? (
          <List
            dataSource={skeletonItems}
            renderItem={(item) => (
              <List.Item key={item} className="list-item contact-list__item">
                <Skeleton avatar title={false} paragraph={{ rows: 2 }} active />
              </List.Item>
            )}
            split={false}
          />
        ) : showResults ? (
          <>
            {pagedFilteredContacts.length > 0 && (
              <>
                <Title level={5} style={{ padding: '10px 0 0 10px' }}>
                  {t('CONTACTS')}
                </Title>
                <List
                  dataSource={pagedFilteredContacts}
                  renderItem={(msg) => (
                    <ChatListItem
                      key={msg.chatId}
                      lastMessage={msg}
                      onNameExtracted={handleNameExtracted}
                      showDescription={false}
                    />
                  )}
                  split={false}
                />
              </>
            )}

            {pagedFilteredMessages.length > 0 && (
              <>
                <Title level={5} style={{ padding: '10px 0 0 10px' }}>
                  {t('MESSAGES')}
                </Title>
                <List
                  dataSource={pagedFilteredMessages}
                  renderItem={(msg) => (
                    <ChatListItem
                      key={`${msg.chatId}-${msg.idMessage}`}
                      lastMessage={msg}
                      onNameExtracted={handleNameExtracted}
                      unreadCount={unreadCounts[msg.chatId]}
                      onClearUnread={() => clearUnreadCount(msg.chatId)}
                    />
                  )}
                  split={false}
                />
              </>
            )}

            {pagedFilteredContacts.length === 0 && pagedFilteredMessages.length === 0 && (
              <Empty
                className="empty mt-10"
                description={t('NOTHING_FOUND') || 'Ничего не найдено'}
              />
            )}
          </>
        ) : (
          <List
            dataSource={displayedMessages}
            renderItem={(message) => (
              <ChatListItem
                key={message.chatId}
                lastMessage={message}
                onNameExtracted={handleNameExtracted}
                unreadCount={unreadCounts[message.chatId]}
                onClearUnread={() => clearUnreadCount(message.chatId)}
              />
            )}
            loading={{
              spinning: false,
              className: `${isMiniVersion ? 'min-height-460' : 'height-720'}`,
              size: 'large',
            }}
            locale={{
              emptyText: <Empty className="empty p-10" description={t('EMPTY_CHAT_LIST')} />,
            }}
          />
        )}
      </div>
    </>
  );
};

export default ChatList;
