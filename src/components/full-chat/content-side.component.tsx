import { FC } from 'react';

import ContactChat from './contact-chat/contact-chat.component';
import HomeView from './home-view.component';
import { useAppSelector } from 'hooks';
import { selectActiveChat } from 'store/slices/chat.slice';

const ContentSide: FC = () => {
  const activeChat = useAppSelector(selectActiveChat);

  if (activeChat) {
    return (
      <div className="content-side">
        <ContactChat />
      </div>
    );
  }

  return (
    <div className="content-side">
      <HomeView />
    </div>
  );
};

export default ContentSide;
