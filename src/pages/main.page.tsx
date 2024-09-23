import { FC } from 'react';

import ContactChat from 'components/full-chat/contact-chat/contact-chat.component';
import HomeView from 'components/full-chat/home-view.component';
import { useAppSelector } from 'hooks';
import { selectActiveChat } from 'store/slices/chat.slice';

const Main: FC = () => {
  const activeChat = useAppSelector(selectActiveChat);

  return activeChat ? <ContactChat /> : <HomeView />;
};

export default Main;
