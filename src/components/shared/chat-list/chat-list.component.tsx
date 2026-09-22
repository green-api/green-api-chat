import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Empty, Flex, List, Spin, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import ChatListItem from './chat-list-item.component';
import ChatSearchInput from './chat-search-input.component';
import { useAppDispatch, useAppSelector, useMediaQuery } from 'hooks';
import {
  useGetChatsQuery,
  useLazyGetChatLastMessageQuery,
  useReadChatMutation,
} from 'services/green-api/endpoints';
import {
  chatActions,
  selectActiveChat,
  selectLastMessagesByChatId,
  selectMiniVersion,
  selectSearchQuery,
  selectType,
} from 'store/slices/chat.slice';
import { selectInstance } from 'store/slices/instances.slice';
import { GetChatsResponseInterface, MessageInterface } from 'types';
import {
  chatToMessage,
  fetchChatLastMessage,
  filterMessagesByText,
  getCachedGetChatHistoryMessages,
  getErrorMessage,
  isMessage,
  isNotReaction,
  loadSequentiallyWithDelay,
  updateAllChats,
} from 'utils';

const { Title } = Typography;
const CHATS_BATCH_SIZE = 100;
const CHATS_POLLING_INTERVAL = 15000;
const CHAT_HISTORY_REQUEST_DELAY = 800;
const CHAT_HISTORY_REFRESH_INTERVAL = 60000;
// How far (in px) from the true bottom the next batch starts loading. Large enough that
// it lands before the user runs out of rendered chats to scroll through, instead of only
// firing once they hit the physical end of the list.
const SCROLL_LOAD_THRESHOLD_PX = 300;

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
  const activeChat = useAppSelector(selectActiveChat);

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
  const [getChatLastMessage] = useLazyGetChatLastMessageQuery();
  const [readChat] = useReadChatMutation();

  const chatListRef = useRef<HTMLDivElement | null>(null);
  const pendingHistoryChatIdsRef = useRef<Set<string>>(new Set());
  // Guards the scroll listener against firing another page bump before the previous one
  // has actually rendered — cleared by the effect below once that happens, not by a fixed
  // timer, so there's no artificial delay between reaching the load zone and more chats
  // appearing.
  const isLoadScheduledRef = useRef(false);

  const limit = isMiniVersion ? 5 : matchMedia ? 16 : 12;

  const handleNameExtracted = (chatId: string, name: string) => {
    setContactNames((prev) => ({
      ...prev,
      [chatId]: name.toLowerCase(),
    }));
  };

  const chatPlaceholders = useMemo(() => chats.map(chatToMessage), [chats]);

  const apiUnreadCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    chats.forEach((chat) => {
      if (typeof chat.unreadCount === 'number') {
        counts[chat.chatId] = chat.unreadCount;
      }
    });

    return counts;
  }, [chats]);

  const renderedChats = useMemo(() => chats.slice(0, page * limit), [chats, page, limit]);
  const renderedChatsRef = useRef(renderedChats);
  renderedChatsRef.current = renderedChats;

  // Read inside the sweep's in-flight loop (see runHistorySweep below) so a chat opened
  // mid-sweep can stop it immediately, instead of only blocking sweeps that haven't
  // started yet.
  const activeChatRef = useRef(activeChat);
  activeChatRef.current = activeChat;

  const allMessages: MessageInterface[] = useMemo(
    () =>
      chats.map((chat) => {
        const message = lastMessagesByChatId[chat.chatId];

        return message ?? chatToMessage(chat);
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
      if (type === 'mobile-mode' && activeChat?.chatId) return;

      const chatsToLoad = candidates.filter(
        (chat) => !pendingHistoryChatIdsRef.current.has(chat.chatId)
      );

      if (!chatsToLoad.length) return;

      setIsHistoryLoading(true);
      chatsToLoad.forEach((chat) => pendingHistoryChatIdsRef.current.add(chat.chatId));

      loadSequentiallyWithDelay(
        chatsToLoad,
        CHAT_HISTORY_REQUEST_DELAY,
        async (chat) => {
          try {
            const { message } = await fetchChatLastMessage(
              chat,
              instanceCredentials,
              getChatLastMessage
            );

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
        },
        () => type === 'mobile-mode' && !!activeChatRef.current?.chatId
      ).then((results) => {
        // Items past `results.length` never reached the worker (the loop stopped early),
        // so they were never actually requested — release their pending mark or they'd be
        // stuck "in flight" forever and never get swept again.
        chatsToLoad
          .slice(results.length)
          .forEach((chat) => pendingHistoryChatIdsRef.current.delete(chat.chatId));

        setIsHistoryLoading(false);
      });
    },
    [instanceCredentials, getChatLastMessage, dispatch, type, activeChat?.chatId]
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

  // Marks the currently open chat as read whenever getChats reports unread messages for
  // it — both right after opening it and if new messages arrive while it stays open.
  const activeChatUnreadCount = activeChat ? apiUnreadCounts[activeChat.chatId] : undefined;

  useEffect(() => {
    if (!activeChat?.chatId || !activeChatUnreadCount) return;

    readChat({ ...instanceCredentials, chatId: activeChat.chatId });
  }, [activeChat?.chatId, activeChatUnreadCount, instanceCredentials, readChat]);

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

  // Scroll state is read through this ref instead of the effect's dependency array so that
  // background updates (last-message sweeps, polling, etc.) don't tear down and recreate the
  // listener mid-flight — that used to cancel an already-scheduled scrollTimer before it fired,
  // silently delaying the next batch load until another scroll event happened to arrive.
  const scrollStateRef = useRef({
    chats,
    chatsCount,
    isFetching,
    showResults,
    filteredContacts,
    filteredMessages,
    contactsPage,
    messagesPage,
    allMessages,
    page,
    limit,
  });
  scrollStateRef.current = {
    chats,
    chatsCount,
    isFetching,
    showResults,
    filteredContacts,
    filteredMessages,
    contactsPage,
    messagesPage,
    allMessages,
    page,
    limit,
  };

  // Releases the scroll guard once a page bump actually lands (new chats rendered, or the
  // raw list grew via background polling) — not on a fixed timer, so the next batch can
  // start loading as soon as the previous one is visible instead of after an artificial wait.
  useEffect(() => {
    isLoadScheduledRef.current = false;
  }, [page, contactsPage, messagesPage, chatsCount, chats.length]);

  useEffect(() => {
    const element = chatListRef.current;
    if (!element) return;

    // Only for loadMoreChats' isFetching retry below — a genuine "wait for the network"
    // case, not an artificial UX delay, so it stays a timer.
    let retryTimer: number;

    const loadMoreChats = () => {
      const { isFetching, chats, chatsCount } = scrollStateRef.current;

      if (isFetching) {
        retryTimer = window.setTimeout(loadMoreChats, 500);
        return;
      }

      if (chats.length >= chatsCount) {
        setChatsCount((prev) => prev + CHATS_BATCH_SIZE);
      } else {
        // Already at the true end of the data — nothing changed, so nothing will trigger
        // the release effect above. Release here so a future scroll event (once background
        // polling grows `chats`) can still retry.
        isLoadScheduledRef.current = false;
      }
    };

    const handleScrollBottom = () => {
      const nearBottom =
        element.scrollTop + element.offsetHeight + SCROLL_LOAD_THRESHOLD_PX >= element.scrollHeight;

      if (!nearBottom) {
        isLoadScheduledRef.current = false;
        return;
      }

      if (isLoadScheduledRef.current) return;
      isLoadScheduledRef.current = true;

      const {
        showResults,
        filteredContacts,
        filteredMessages,
        contactsPage,
        messagesPage,
        allMessages,
        page,
        limit,
      } = scrollStateRef.current;

      if (showResults) {
        if (filteredContacts.length > contactsPage * limit) {
          setContactsPage((prev) => prev + 1);
          return;
        }

        if (filteredMessages.length > messagesPage * limit) {
          setMessagesPage((prev) => prev + 1);
          return;
        }

        loadMoreChats();
      } else if (allMessages.length > page * limit) {
        setPage((prev) => prev + 1);
      } else {
        loadMoreChats();
      }
    };

    element.addEventListener('scroll', handleScrollBottom);
    return () => {
      clearTimeout(retryTimer);
      element.removeEventListener('scroll', handleScrollBottom);
    };
  }, [instanceCredentials.idInstance, instanceCredentials.apiTokenInstance]);

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
                      apiUnreadCount={apiUnreadCounts[msg.chatId]}
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
                  apiUnreadCount={apiUnreadCounts[message.chatId]}
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
