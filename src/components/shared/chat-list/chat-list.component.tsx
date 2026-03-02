import { FC, useEffect, useRef, useState } from 'react';

import { Empty, Flex, List, Spin, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import ChatListItem from './chat-list-item.component';
import ChatSearchInput from './chat-search-input.component';
import { useAppSelector, useMediaQuery } from 'hooks';
import { useLastMessagesQuery } from 'services/green-api/endpoints';
import { selectMiniVersion, selectSearchQuery } from 'store/slices/chat.slice';
import { selectInstance } from 'store/slices/instances.slice';
import { MessageInterface } from 'types';
import { filterContacts, filterMessagesByText, getErrorMessage, getLastChats } from 'utils';

const { Title } = Typography;

const ChatList: FC = () => {
  const instanceCredentials = useAppSelector(selectInstance);
  const isMiniVersion = useAppSelector(selectMiniVersion);
  const searchQuery = useAppSelector(selectSearchQuery);

  const matchMedia = useMediaQuery('(min-height: 1200px)');

  const { t } = useTranslation();

  const { data, isLoading, error } = useLastMessagesQuery(
    { ...instanceCredentials, allMessages: true },
    {
      skipPollingIfUnfocused: true,
      pollingInterval: isMiniVersion ? 17000 : 15000,
      skip: !instanceCredentials?.idInstance || !instanceCredentials.apiTokenInstance,
    }
  );

  const chatListRef = useRef<HTMLDivElement | null>(null);

  const [contactNames, setContactNames] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [contactsPage, setContactsPage] = useState(1);
  const [messagesPage, setMessagesPage] = useState(1);
  const [initialLoaded, setInitialLoaded] = useState(false);

  const [initialMessageIds, setInitialMessageIds] = useState<Set<string>>(new Set());
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  const limit = isMiniVersion ? 5 : matchMedia ? 16 : 12;

  const handleNameExtracted = (chatId: string, name: string) => {
    setContactNames((prev) => ({
      ...prev,
      [chatId]: name.toLowerCase(),
    }));
  };

  const allMessages: MessageInterface[] = data ?? [];

  const lastMessages = getLastChats(allMessages, [], isMiniVersion ? limit : undefined);
  const filteredContacts = filterContacts(allMessages, contactNames, searchQuery);
  const filteredMessages = filterMessagesByText(allMessages, searchQuery);

  const showResults = searchQuery.trim() !== '';

  const pagedFilteredContacts = filteredContacts.slice(0, contactsPage * limit);
  const pagedFilteredMessages = filteredMessages.slice(0, messagesPage * limit);

  useEffect(() => {
    if (!initialLoaded && allMessages.length > 0) {
      const messageIds = new Set(
        allMessages.map((msg) => msg.idMessage || `${msg.chatId}-${msg.timestamp}`)
      );
      setInitialMessageIds(messageIds);
      setInitialLoaded(true);
    }
  }, [allMessages, initialLoaded]);

  useEffect(() => {
    if (!initialLoaded || allMessages.length === 0) return;

    const prevIds = initialMessageIds;
    const newIds = new Set(prevIds);

    const newUnreadCounts: Record<string, number> = { ...unreadCounts };

    allMessages
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
  }, [allMessages, initialLoaded]);

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
          updated[msg.chatId] = msg.chatId?.toLowerCase();
        }
      });
      return updated;
    });
  }, [allMessages]);

  useEffect(() => {
    const element = chatListRef.current;
    if (!element) return;

    let scrollTimer: number;

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
          }
        } else {
          if (lastMessages.length > page * limit) {
            scrollTimer = setTimeout(() => setPage((prev) => prev + 1), 500);
          }
        }
      }
    };

    element.addEventListener('scroll', handleScrollBottom);
    return () => element.removeEventListener('scroll', handleScrollBottom);
  }, [
    filteredContacts,
    filteredMessages,
    lastMessages,
    contactsPage,
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
      <ChatSearchInput setPage={setPage} />

      <div
        ref={chatListRef}
        className={`contact-list px-2 overflow-auto ${isMiniVersion ? 'min-height-460' : 'height-720'}`}
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
          <List
            dataSource={lastMessages.slice(0, page * limit)}
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
              spinning: isLoading || (!data?.length && !isMiniVersion),
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
