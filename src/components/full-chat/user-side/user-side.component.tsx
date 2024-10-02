import { FC } from 'react';

import UserSideFooter from './user-side-footer.component';
import { USER_SIDE_ITEMS } from 'configs';
import { useAppSelector } from 'hooks';
import { selectMiniVersion, selectType, selectUserSideActiveMode } from 'store/slices/chat.slice';

const UserSide: FC = () => {
  const userSideActiveMode = useAppSelector(selectUserSideActiveMode);
  const isMiniVersion = useAppSelector(selectMiniVersion);
  const type = useAppSelector(selectType);

  const content = USER_SIDE_ITEMS.find((item) => item.item === userSideActiveMode);

  return (
    <div className="user-side">
      {content?.element}
      {!isMiniVersion && type === 'tab' && <UserSideFooter />}
    </div>
  );
};

export default UserSide;
