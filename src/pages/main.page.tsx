import { FC } from 'react';

import ContactChat from 'components/full-chat/content-side/contact-chat/contact-chat.component';
import HomeView from 'components/full-chat/content-side/home-view.component';
import { AuthInstance } from 'components/instance-auth/instance-auth.component';
import { useAppSelector } from 'hooks';
import { selectActiveChat } from 'store/slices/chat.slice';
import { selectIsAuthorizingInstance } from 'store/slices/instances.slice';

const Main: FC = () => {
  const activeChat = useAppSelector(selectActiveChat);
  const isAuthorizingInstance = useAppSelector(selectIsAuthorizingInstance);

  if (isAuthorizingInstance) return <AuthInstance />;

  return activeChat ? <ContactChat /> : <HomeView />;
};

export default Main;
