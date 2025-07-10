import { FC, useState } from 'react';

import { UserAddOutlined } from '@ant-design/icons';
import { Flex } from 'antd';
import { useTranslation } from 'react-i18next';

import AddNewChat from './add-new-chat.component';
import ChatsHeader from './chats-header.component';
import ChatList from 'components/shared/chat-list/chat-list.component';
import SelectInstance from 'components/UI/select/select-instance.component';
import SelectStatusMode from 'components/UI/select/select-status.component';
import { useAppSelector } from 'hooks';
import { selectMiniVersion, selectType } from 'store/slices/chat.slice';
import { selectInstance } from 'store/slices/instances.slice';

const Chats: FC = () => {
  const isMiniVersion = useAppSelector(selectMiniVersion);
  const type = useAppSelector(selectType);
  const instanceCredentials = useAppSelector(selectInstance);

  const { t } = useTranslation();

  const [isVisible, setIsVisible] = useState(false);

  return (
    <Flex className="chats" vertical>
      {!isMiniVersion && type === 'tab' && <ChatsHeader />}

      <Flex
        align="center"
        gap={8}
        style={{ padding: '0 5px' }}
        justify={type === 'partner-iframe' ? 'end' : 'space-around'}
      >
        {type !== 'partner-iframe' && <SelectInstance />}
        {!isMiniVersion && (type === 'console-page' || type === 'partner-iframe') && (
          <a className={type === 'partner-iframe' ? 'p-10' : undefined}>
            <UserAddOutlined
              style={{ fontSize: 20 }}
              onClick={() => setIsVisible(true)}
              title={t('ADD_NEW_CHAT_HEADER')}
            />
          </a>
        )}
        <SelectStatusMode />
      </Flex>

      <ChatList key={instanceCredentials?.idInstance} />
      {!isMiniVersion && (type === 'console-page' || type === 'partner-iframe') && (
        <AddNewChat isVisible={isVisible} setIsVisible={setIsVisible} />
      )}
    </Flex>
  );
};

export default Chats;
