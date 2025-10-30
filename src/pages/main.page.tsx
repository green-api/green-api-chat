import { FC } from 'react';

import ContactChat from 'components/full-chat/content-side/contact-chat/contact-chat.component';
import HomeView from 'components/full-chat/content-side/home-view.component';
import { SendMediaStatus } from 'components/full-chat/user-side/statuses/send-media-status.component';
import { SendTextStatus } from 'components/full-chat/user-side/statuses/send-text-status.component';
import { AuthInstance } from 'components/instance-auth/instance-auth.component';
import { useAppSelector } from 'hooks';
import { selectActiveChat } from 'store/slices/chat.slice';
import { selectIsAuthorizingInstance, selectIsSendingStatus } from 'store/slices/instances.slice';

const Main: FC = () => {
  const activeChat = useAppSelector(selectActiveChat);
  const isAuthorizingInstance = useAppSelector(selectIsAuthorizingInstance);
  const isSendingStatus = useAppSelector(selectIsSendingStatus);

  if (isSendingStatus === 'text') return <SendTextStatus />;
  if (isSendingStatus === 'media') return <SendMediaStatus />;

  if (isAuthorizingInstance) return <AuthInstance />;

  return activeChat ? <ContactChat /> : <HomeView />;
};

export default Main;
