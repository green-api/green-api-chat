import { FC } from 'react';

import ContactChat from 'components/full-chat/content-side/contact-chat/contact-chat.component';
import HomeView from 'components/full-chat/content-side/home-view.component';
import { AuthInstance } from 'components/instance-auth/instance-auth.component';
import { MaxAuth } from 'components/instance-auth/max-auth.component';
import { useAppSelector } from 'hooks';
import { isMaxInstance, useIsMaxInstance } from 'hooks/use-is-max-instance';
import { selectActiveChat } from 'store/slices/chat.slice';
import { selectIsAuthorizingInstance } from 'store/slices/instances.slice';

const Main: FC = () => {
  const activeChat = useAppSelector(selectActiveChat);
  const isAuthorizingInstance = useAppSelector(selectIsAuthorizingInstance);
  const isMax = useIsMaxInstance();

  if (isAuthorizingInstance) return isMax ? <MaxAuth /> : <AuthInstance />;

  return activeChat ? <ContactChat /> : <HomeView />;
};

export default Main;
