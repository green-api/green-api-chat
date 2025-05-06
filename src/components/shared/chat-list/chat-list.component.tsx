import { FC, useEffect, useRef, useState } from 'react';
import { Empty, Flex, Input, List, Spin, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import ChatListItem from './chat-list-item.component';
import { useAppSelector, useMediaQuery } from 'hooks';
import { useLastMessagesQuery } from 'services/green-api/endpoints';
import { selectMiniVersion } from 'store/slices/chat.slice';
import { selectInstance } from 'store/slices/instances.slice';
import { MessageInterface } from 'types';
import { getErrorMessage, getLastChats } from 'utils';

const { Title } = Typography;

const ChatList: FC = () => {
  const instanceCredentials = useAppSelector(selectInstance);
  const isMiniVersion = useAppSelector(selectMiniVersion);
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
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const limit = isMiniVersion ? 5 : matchMedia ? 16 : 12;

  const handleNameExtracted = (chatId: string, name: string) => {
    setContactNames((prev) => ({
      ...prev,
      [chatId]: name.toLowerCase(),
    }));
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value.toLowerCase());
    setPage(1);
  };

  const allMessages: MessageInterface[] = data ?? [];

  const lastMessages = getLastChats(allMessages, [], isMiniVersion ? limit : undefined);

  const filteredContacts = Array.from(
    allMessages.reduce((acc, msg) => {
      const name = contactNames[msg.chatId] || '';
      if (name.includes(searchQuery) && !acc.has(msg.chatId)) {
        acc.set(msg.chatId, msg);
      }
      return acc;
    }, new Map<string, MessageInterface>())
  ).map(([, message]) => message);

  const filteredMessages =
    allMessages.filter((msg) => {
      let text = '';
      if (msg.typeMessage === 'extendedTextMessage') {
        text = msg.extendedTextMessage?.text || '';
      } else if (msg.typeMessage === 'textMessage') {
        text = msg.textMessage || '';
      }

      return text.toLowerCase().includes(searchQuery);
    }) ?? [];

  const showResults = searchQuery.trim() !== '';

  useEffect(() => {
    const element = chatListRef.current;
    if (!element) return;

    let setPageTimer: number;

    const handleScrollBottom = () => {
      if (
        element.scrollTop + element.offsetHeight + 50 >= element.scrollHeight &&
        lastMessages.length > page * limit
      ) {
        clearTimeout(setPageTimer);
        setPageTimer = setTimeout(() => {
          setPage((prev) => prev + 1);
        }, 500);
      }
    };

    element.addEventListener('scroll', handleScrollBottom);
    return () => element.removeEventListener('scroll', handleScrollBottom);
  }, [lastMessages, page]);

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
      <div style={{ margin: 8 }}>
        <Input
          placeholder={t('SEARCH_PLACEHOLDER')}
          value={searchQuery}
          onChange={handleSearch}
          className="chat-list-search p-2"
          allowClear
        />
      </div>

      <div
        ref={chatListRef}
        className={`contact-list px-2 overflow-auto ${isMiniVersion ? 'min-height-460' : 'height-720'}`}
      >
        {showResults ? (
          <>
            {filteredContacts.length > 0 && (
              <>
                <Title level={5} style={{ padding: '10px 0 0 10px' }}>
                  {t('CONTACTS')}
                </Title>
                <List
                  dataSource={filteredContacts}
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

            {filteredMessages.length > 0 && (
              <>
                <Title level={5} style={{ padding: '10px 0 0 10px' }}>
                  {t('MESSAGES')}
                </Title>
                <List
                  dataSource={filteredMessages}
                  renderItem={(msg) => (
                    <ChatListItem
                      key={`${msg.chatId}-${msg.idMessage}`}
                      lastMessage={msg}
                      onNameExtracted={handleNameExtracted}
                    />
                  )}
                  split={false}
                />
              </>
            )}

            {filteredContacts.length === 0 && filteredMessages.length === 0 && (
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
              />
            )}
            loading={{
              spinning: isLoading,
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
