import { FC, useEffect } from 'react';

import { useSearchParams } from 'react-router-dom';

import { ChatType } from '../types';
import ContactChat from 'components/full-chat/contact-chat/contact-chat.component';
import HomeView from 'components/full-chat/home-view.component';
import { useActions, useAppSelector } from 'hooks';
import { selectActiveChat } from 'store/slices/chat.slice';

const Main: FC = () => {
  const activeChat = useAppSelector(selectActiveChat);
  const [params] = useSearchParams();

  const { setType } = useActions();

  useEffect(() => {
    if (params.has('type')) {
      setType(params.get('type') as ChatType);
    }
  }, [params]);

  return activeChat ? <ContactChat /> : <HomeView />;
};

export default Main;
