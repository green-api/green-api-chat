import { FC, useEffect } from 'react';

import { useTranslation } from 'react-i18next';

import ContactChat from 'components/full-chat/content-side/contact-chat/contact-chat.component';
import HomeView from 'components/full-chat/content-side/home-view.component';
import { SendMediaStatus } from 'components/full-chat/user-side/statuses/send-media-status.component';
import { SendTextStatus } from 'components/full-chat/user-side/statuses/send-text-status.component';
import { AuthInstance } from 'components/instance-auth/instance-auth.component';
import { MaxAuth } from 'components/instance-auth/max-auth.component';
import { useAppSelector } from 'hooks';
import { useIsMaxInstance } from 'hooks/use-is-max-instance';
import { selectActiveChat } from 'store/slices/chat.slice';
import { selectIsAuthorizingInstance, selectIsSendingStatus } from 'store/slices/instances.slice';
import { MessageEventTypeEnum } from 'types';

const Main: FC = () => {
  const activeChat = useAppSelector(selectActiveChat);
  const isAuthorizingInstance = useAppSelector(selectIsAuthorizingInstance);
  const isSendingStatus = useAppSelector(selectIsSendingStatus);

  if (isSendingStatus === 'text') return <SendTextStatus />;
  if (isSendingStatus === 'media') return <SendMediaStatus />;
  const isMax = useIsMaxInstance();
  const {
    i18n: { resolvedLanguage },
  } = useTranslation();

  useEffect(() => {
    if (resolvedLanguage) {
      window.parent.postMessage(
        {
          type: MessageEventTypeEnum.LOCALE_CHANGE,
          payload: {
            locale: resolvedLanguage,
          },
        },
        '*'
      );
    }
  }, [resolvedLanguage]);

  if (isAuthorizingInstance) return isMax ? <MaxAuth /> : <AuthInstance />;

  return activeChat ? <ContactChat /> : <HomeView />;
};

export default Main;
