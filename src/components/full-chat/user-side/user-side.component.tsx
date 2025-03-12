import { FC } from 'react';

import UserSideFooter from './user-side-footer.component';
import { USER_SIDE_ITEMS } from 'configs';
import { useAppSelector, useMediaQuery } from 'hooks';
import { selectActiveChat, selectType, selectUserSideActiveMode } from 'store/slices/chat.slice';

const UserSide: FC = () => {
  const userSideActiveMode = useAppSelector(selectUserSideActiveMode);
  const type = useAppSelector(selectType);
  const activeChat = useAppSelector(selectActiveChat);

  const matchMedia = useMediaQuery('(max-width: 975px)');

  const content = USER_SIDE_ITEMS.find((item) => item.item === userSideActiveMode);

  return (
    <div
      className={`user-side relative ${matchMedia && activeChat ? 'display-none' : ''} ${type === 'tab' ? 'chat-border' : ''}`}
    >
      {content?.element}
      {(type === 'tab' || type === 'partner-iframe') && <UserSideFooter />}
    </div>
  );
};

export default UserSide;
