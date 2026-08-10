import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Empty, Flex, List, Spin, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import ChatListItem from './chat-list-item.component';
import ChatSearchInput from './chat-search-input.component';
import { useAppDispatch, useAppSelector, useMediaQuery } from 'hooks';
import { useGetChatsQuery, useLazyGetChatHistoryQuery } from 'services/green-api/endpoints';
import {
  chatActions,
  selectLastMessagesByChatId,
  selectMiniVersion,
  selectSearchQuery,
  selectType,
} from 'store/slices/chat.slice';
import { selectInstance } from 'store/slices/instances.slice';
import { GetChatsResponseInterface, InstanceInterface, MessageInterface } from 'types';
import {
  filterMessagesByText,
  getCachedGetChatHistoryMessages,
  getErrorMessage,
  updateAllChats,
} from 'utils';

const { Title } = Typography;
const CHATS_BATCH_SIZE = 100;
const CHATS_POLLING_INTERVAL = 15000;
const CHAT_HISTORY_REQUEST_DELAY = 800;
const CHAT_HISTORY_RETRY_LIMIT = 5;
const CHAT_HISTORY_RETRY_BASE_DELAY = 1000;
const CHAT_HISTORY_REFRESH_INTERVAL = 60000;

const isMessage = (message: MessageInterface | null): message is MessageInterface =>
  message !== null;

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

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchChatLastMessage = async (
  chat: GetChatsResponseInterface,
  instanceCredentials: InstanceInterface,
  getChatHistory: ReturnType<typeof useLazyGetChatHistoryQuery>[0]
): Promise<{ chat: GetChatsResponseInterface; message?: MessageInterface }> => {
  for (let attempt = 0; attempt <= CHAT_HISTORY_RETRY_LIMIT; attempt++) {
    const { data: history, error } = await getChatHistory({
      ...instanceCredentials,
      chatId: chat.chatId,
      count: 1,
    });

    if (!error) {
      return { chat, message: history?.find(isNotReaction) };
    }

    const isRateLimited = 'status' in error && error.status === 429;

    if (!isRateLimited || attempt === CHAT_HISTORY_RETRY_LIMIT) {
      return { chat, message: undefined };
    }

    await wait(CHAT_HISTORY_RETRY_BASE_DELAY * (attempt + 1));
  }

  return { chat, message: undefined };
};

const loadSequentiallyWithDelay = async <Item, Result>(
  items: Item[],
  delayMs: number,
  worker: (item: Item) => Promise<Result>
): Promise<Result[]> => {
  const results: Result[] = [];

  for (const [index, item] of items.entries()) {
    results.push(await worker(item));

    if (index < items.length - 1) {
      await wait(delayMs);
    }
  }

  return results;
};

const ChatList: FC = () => {
  const instanceCredentials = useAppSelector(selectInstance);
  const isMiniVersion = useAppSelector(selectMiniVersion);
  const searchQuery = useAppSelector(selectSearchQuery);
  const greenApiQueries = useAppSelector((state) => state.greenAPI.queries);
  const type = useAppSelector(selectType);

  const matchMedia = useMediaQuery('(min-height: 1200px)');

  const { t } = useTranslation();

  const dispatch = useAppDispatch();
  const lastMessagesByChatId = useAppSelector(selectLastMessagesByChatId);

  const [contactNames, setContactNames] = useState<Record<string, string>>({});
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
  } = useGetChatsQuery(
    { ...instanceCredentials, count: chatsCount },
    {
      skipPollingIfUnfocused: true,
      pollingInterval: CHATS_POLLING_INTERVAL,
      skip: !instanceCredentials?.idInstance || !instanceCredentials.apiTokenInstance,
    }
  );
  const [getChatHistory] = useLazyGetChatHistoryQuery();

  const chatListRef = useRef<HTMLDivElement | null>(null);
  const pendingHistoryChatIdsRef = useRef<Set<string>>(new Set());

  const limit = isMiniVersion ? 5 : matchMedia ? 16 : 12;

  const handleNameExtracted = (chatId: string, name: string) => {
    setContactNames((prev) => ({
      ...prev,
      [chatId]: name.toLowerCase(),
    }));
  };

  const chatPlaceholders = useMemo(() => chats.map(chatToMessage), [chats]);

  const renderedChats = useMemo(() => chats.slice(0, page * limit), [chats, page, limit]);
  const renderedChatsRef = useRef(renderedChats);
  renderedChatsRef.current = renderedChats;

  const allMessages: MessageInterface[] = useMemo(
    () =>
      chats.map((chat) => {
        const message = lastMessagesByChatId[chat.chatId];

        return message && isNotReaction(message) ? message : chatToMessage(chat);
      }),
    [chats, lastMessagesByChatId]
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
    () =>
      updateAllChats(
        Object.values(lastMessagesByChatId).filter(isMessage),
        cachedGetChatHistoryMessages,
        []
      ),
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

  useEffect(() => {
    // Note: lastMessagesByChatId itself is NOT reset here — it lives in Redux and is
    // cleared reactively (in chat.slice's extraReducers) only when the instance actually
    // changes, so it survives this component unmounting/remounting (e.g. navigating away
    // and back). This effect only resets local UI/pagination state.
    pendingHistoryChatIdsRef.current.clear();
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

  // Fetches the last message for a batch of chats, sequentially with a delay between
  // requests to stay clear of 429s. Independent of getChats' polling — callers decide
  // when a sweep should run (on newly rendered chats, or on the fixed refresh interval).
  const runHistorySweep = useCallback(
    (candidates: GetChatsResponseInterface[]) => {
      const chatsToLoad = candidates.filter(
        (chat) => !pendingHistoryChatIdsRef.current.has(chat.chatId)
      );

      if (!chatsToLoad.length) return;

      setIsHistoryLoading(true);
      chatsToLoad.forEach((chat) => pendingHistoryChatIdsRef.current.add(chat.chatId));

      loadSequentiallyWithDelay(chatsToLoad, CHAT_HISTORY_REQUEST_DELAY, async (chat) => {
        try {
          const { message } = await fetchChatLastMessage(chat, instanceCredentials, getChatHistory);

          dispatch(
            chatActions.setLastMessageByChatId({
              chatId: chat.chatId,
              message: message
                ? {
                    ...message,
                    chatId: chat.chatId,
                    chatType: chat.type,
                    senderName: chat.name,
                    senderContactName: chat.name,
                  }
                : null,
            })
          );
        } finally {
          pendingHistoryChatIdsRef.current.delete(chat.chatId);
        }
      }).then(() => {
        setIsHistoryLoading(false);
      });
    },
    [instanceCredentials, getChatHistory, dispatch]
  );

  useEffect(() => {
    if (!instanceCredentials?.idInstance || !instanceCredentials.apiTokenInstance) return;

    // lastMessagesByChatId is read fresh here but intentionally left out of the deps below:
    // this effect only needs to react to newly rendered chats or an instance switch, not to
    // every cache update the sweep itself produces.
    const unresolvedChats = renderedChats.filter((chat) => !(chat.chatId in lastMessagesByChatId));

    runHistorySweep(unresolvedChats);
  }, [renderedChats, instanceCredentials, runHistorySweep]);

  useEffect(() => {
    if (!instanceCredentials?.idInstance || !instanceCredentials.apiTokenInstance) return;

    // Runs on its own clock, fully decoupled from getChats' polling interval —
    // refreshing every chat's last message once a minute regardless of how often
    // (or rarely) the chats list itself refetches.
    const intervalId = setInterval(() => {
      runHistorySweep(renderedChatsRef.current);
    }, CHAT_HISTORY_REFRESH_INTERVAL);

    return () => clearInterval(intervalId);
  }, [instanceCredentials, runHistorySweep]);

  useEffect(() => {
    if (initialLoaded || isHistoryLoading) return;

    const loadedMessages = Object.values(lastMessagesByChatId)
      .filter(isMessage)
      .filter(isNotReaction);

    if (loadedMessages.length === 0) return;

    const messageIds = new Set(
      loadedMessages.map((msg) => msg.idMessage || `${msg.chatId}-${msg.timestamp}`)
    );
    setInitialMessageIds(messageIds);
    setInitialLoaded(true);
  }, [lastMessagesByChatId, initialLoaded, isHistoryLoading]);

  useEffect(() => {
    const loadedMessages = Object.values(lastMessagesByChatId)
      .filter(isMessage)
      .filter(isNotReaction);

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
        className={`empty p-10 ${isMiniVersion ? 'min-height-320' : 'height-720'}`}
        description={t('SELECT_INSTANCE_PLACEHOLDER')}
      />
    );
  }

  if (error) {
    if ('status' in error && error.status === 429) {
      return (
        <Flex
          className={`contact-list ${isMiniVersion ? 'min-height-320' : 'height-720'}`}
          align="center"
          justify="center"
        >
          <Spin size="large" />
        </Flex>
      );
    }

    return (
      <Empty
        className={`empty p-10 ${isMiniVersion ? 'min-height-320' : 'height-720'}`}
        description={getErrorMessage(error, t)}
      />
    );
  }

  return (
    <>
      {type !== 'mobile-mode' && <ChatSearchInput setPage={setPage} />}

      <div
        ref={chatListRef}
        className={`contact-list px-2 overflow-auto ${isMiniVersion ? 'min-height-320' : 'height-720'}`}
      >
        {showResults ? (
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
          <>
            <List
              dataSource={displayedMessages}
              renderItem={(message) => (
                <ChatListItem
                  key={message.chatId}
                  lastMessage={message}
                  onNameExtracted={handleNameExtracted}
                  unreadCount={unreadCounts[message.chatId]}
                  onClearUnread={() => clearUnreadCount(message.chatId)}
                  isLastMessageLoading={!(message.chatId in lastMessagesByChatId)}
                />
              )}
              loading={{
                spinning: isLoading,
                className: `${isMiniVersion ? 'min-height-320' : 'height-720'}`,
                size: 'large',
              }}
              locale={{
                emptyText: <Empty className="empty p-10" description={t('EMPTY_CHAT_LIST')} />,
              }}
            />
            {!isChatListLoading &&
              !isMiniVersion &&
              allMessages.length > 0 &&
              page * limit >= allMessages.length &&
              chats.length < chatsCount && (
                <Typography.Text type="secondary" className="chat-list__end-hint">
                  {t('NO_MORE_CHATS')}
                </Typography.Text>
              )}
          </>
        )}
      </div>
    </>
  );
};

export default ChatList;
