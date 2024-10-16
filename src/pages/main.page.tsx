import { FC, useEffect } from 'react';

import ContactChat from 'components/full-chat/content-side/contact-chat/contact-chat.component';
import HomeView from 'components/full-chat/content-side/home-view.component';
import { useActions, useAppSelector } from 'hooks';
import { selectActiveChat } from 'store/slices/chat.slice';
import { selectInstance } from 'store/slices/instances.slice';

const Main: FC = () => {
  const activeChat = useAppSelector(selectActiveChat);
  const instanceCredentials = useAppSelector(selectInstance);

  const { setActiveChat } = useActions();

  useEffect(() => {
    setActiveChat(null);
  }, [instanceCredentials]);

  return activeChat ? <ContactChat /> : <HomeView />;
};

export default Main;
