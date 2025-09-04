import { FC } from 'react';

import ContactChat from 'components/full-chat/content-side/contact-chat/contact-chat.component';
import HomeView from 'components/full-chat/content-side/home-view.component';
import { useAppSelector } from 'hooks';
import { selectActiveChat } from 'store/slices/chat.slice';
import { selectIsAuthorizingInstance } from 'store/slices/instances.slice';
import { AuthInstance } from 'components/instance-auth/instance-auth.component';

const Main: FC = () => {
  const activeChat = useAppSelector(selectActiveChat);
  const isAurhorizingInstance = useAppSelector(selectIsAuthorizingInstance);
  console.log(isAurhorizingInstance);

  if (isAurhorizingInstance) return <AuthInstance />;

  return activeChat ? <ContactChat /> : <HomeView />;
};

export default Main;
