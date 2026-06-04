import { FC } from 'react';

import { LeftOutlined } from '@ant-design/icons';
import { Flex, Space, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import { useActions, useAppSelector } from 'hooks';
import { useGetChatHistoryQuery, useGetChatsQuery } from 'services/green-api/endpoints';
import { selectActiveChat } from 'store/slices/chat.slice';
import { selectInstance, selectTypeInstance } from 'store/slices/instances.slice';
import { selectPlatform } from 'store/slices/user.slice';
import { getFirstNonEmptyString } from 'utils';

const ChatHeader: FC = () => {
  const activeChat = useAppSelector(selectActiveChat);
  const platform = useAppSelector(selectPlatform);
  const instanceCredentials = useAppSelector(selectInstance);
  const typeInstance = useAppSelector(selectTypeInstance);

  const { t } = useTranslation();

  const { setActiveChat } = useActions();

  if (activeChat) {
    const { data: chats } = useGetChatsQuery(instanceCredentials, {
      skip:
        typeInstance !== 'telegram' ||
        !instanceCredentials?.idInstance ||
        !instanceCredentials?.apiTokenInstance,
    });
    const { data: chatHistory } = useGetChatHistoryQuery(
      {
        ...instanceCredentials,
        chatId: activeChat.chatId,
        count: 20,
      },
      {
        skip:
          !activeChat?.chatId ||
          !instanceCredentials?.idInstance ||
          !instanceCredentials?.apiTokenInstance,
      }
    );
    const telegramChat = chats?.find((chat) => chat.chatId === activeChat.chatId);
    const historySenderName = chatHistory?.find((message) =>
      getFirstNonEmptyString(message.senderName, message.senderContactName)
    );
    const displayName = getFirstNonEmptyString(
      telegramChat?.name,
      activeChat.senderName,
      historySenderName?.senderContactName,
      historySenderName?.senderName,
      activeChat.chatId
    );

    return (
      <Flex align="center" gap={10}>
        <Space className="chatHeader-space">
          <a className="back-button">
            <LeftOutlined onClick={() => setActiveChat(null)} />
          </a>
          <h3 className="text-overflow" title={displayName}>
            {displayName}
          </h3>
        </Space>
        {activeChat.chatId?.includes('@c') && <div>{activeChat.chatId?.replace(/\@.*$/, '')}</div>}
      </Flex>
    );
  }

  return (
    <Flex justify="space-between" align="center">
      <h3 className="text-overflow">{t('CHAT_HEADER')}</h3>
      <Space style={{ gap: 10 }}>
        {platform === 'web' && (
          <Typography.Link
            onClick={() => {
              window.parent.postMessage({ event: 'openChats' }, '*');
            }}
            target="_parent"
            rel="noreferrer"
            title={t('FULL_VERSION_TITLE')}
          >
            {t('FULL_VERSION')}
          </Typography.Link>
        )}
        {/* {tariff === TariffsEnum.Developer && isChatWorking && (
          <Typography.Link title={t('TURN_OFF_CHAT')} onClick={() => setIsChatWorking(false)}>
            <PoweroffOutlined />
          </Typography.Link>
        )} */}
      </Space>
    </Flex>
  );
};

export default ChatHeader;
