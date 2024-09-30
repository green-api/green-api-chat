import { FC } from 'react';

import UserSideFooter from './user-side-footer.component';
import { USER_SIDE_ITEMS } from 'configs';
import { useAppSelector } from 'hooks';
import { selectUserSideActiveMode } from 'store/slices/chat.slice';

const UserSide: FC = () => {
  const userSideActiveMode = useAppSelector(selectUserSideActiveMode);

  const content = USER_SIDE_ITEMS.find((item) => item.item === userSideActiveMode);

  return (
    <div className="user-side">
      {content?.element}
      <UserSideFooter />
    </div>
  );
};

export default UserSide;
