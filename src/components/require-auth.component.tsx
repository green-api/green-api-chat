import { FC } from 'react';

import { Navigate, Outlet } from 'react-router-dom';

import { consoleUrl } from 'configs';
import { useAppSelector } from 'hooks';
import { selectAuth } from 'store/slices/user.slice';

const RequireAuth: FC = () => {
  const isAuth = useAppSelector(selectAuth);

  if (!isAuth) {
    return <Navigate to={consoleUrl} />;
  }

  return <Outlet />;
};

export default RequireAuth;
