import { FC } from 'react';

import { List } from 'antd';

import GroupContactListItem from './group-contact-list-item.component';
import { useAppSelector } from 'hooks';
import { selectActiveChat } from 'store/slices/chat.slice';
import { ActiveChat } from 'types';
import { isContactInfo } from 'utils';

const GroupContactList: FC = () => {
  const activeChat = useAppSelector(selectActiveChat) as ActiveChat;

  if (!activeChat.contactInfo) {
    return null;
  }

  if (isContactInfo(activeChat.contactInfo)) {
    return null;
  }

  return (
    <List
      className="group-contact-list p-10"
      dataSource={activeChat.contactInfo.participants}
      pagination={{
        pageSize: 8,
        showLessItems: true,
      }}
      renderItem={(participant) => <GroupContactListItem participant={participant} />}
    />
  );
};

export default GroupContactList;
