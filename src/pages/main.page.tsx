import { FC, useEffect } from 'react';

import ContactChat from 'components/full-chat/content-side/contact-chat/contact-chat.component';
import HomeView from 'components/full-chat/content-side/home-view.component';
import { SendMediaStatus } from 'components/full-chat/user-side/statuses/send-media-status.component';
import { SendTextStatus } from 'components/full-chat/user-side/statuses/send-text-status.component';
import { AuthInstance } from 'components/instance-auth/instance-auth.component';
import { MaxAuth } from 'components/instance-auth/max-auth.component';
import { TelegramAuth } from 'components/telegram-auth/telegram-auth.component';
import { useAppSelector } from 'hooks';
import { useIsMaxInstance } from 'hooks/use-is-max-instance';
import { useIsTelegramInstance } from 'hooks/use-is-telegram-instance';
import { useTranslation } from 'react-i18next';
import { useGetAccountSettingsQuery } from 'services/green-api/endpoints';
import { selectActiveChat } from 'store/slices/chat.slice';
import {
  selectInstance,
  selectIsAuthorizingInstance,
  selectIsSendingStatus,
} from 'store/slices/instances.slice';
import { MessageEventTypeEnum } from 'types';
import { SendVoiceStatus } from 'components/full-chat/user-side/statuses/send-voice-status.component';

const Main: FC = () => {
  const activeChat = useAppSelector(selectActiveChat);
  const isAuthorizingInstance = useAppSelector(selectIsAuthorizingInstance);
  const isSendingStatus = useAppSelector(selectIsSendingStatus);

  const isMax = useIsMaxInstance();
  const isTelegram = useIsTelegramInstance();
  const instanceData = useAppSelector(selectInstance);

  const { refetch: refetchAccountSettings } = useGetAccountSettingsQuery(
    {
      idInstance: instanceData?.idInstance as number,
      apiTokenInstance: instanceData?.apiTokenInstance as string,
      apiUrl: instanceData?.apiUrl as string,
      mediaUrl: instanceData?.mediaUrl as string,
    },
    {
      skip: !instanceData || (!isMax && !isTelegram),
      refetchOnMountOrArgChange: true,
    }
  );

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

  if (isSendingStatus === 'text') return <SendTextStatus />;
  if (isSendingStatus === 'media') return <SendMediaStatus />;
  if (isSendingStatus === 'voice') return <SendVoiceStatus />;
  if (isAuthorizingInstance)
    return isMax ? (
      <MaxAuth instanceData={instanceData} refetchStateInstace={refetchAccountSettings} />
    ) : isTelegram ? (
      <TelegramAuth instanceData={instanceData} refetchStateInstace={refetchAccountSettings} />
    ) : (
      <AuthInstance />
    );

  return activeChat ? <ContactChat /> : <HomeView />;
};

export default Main;
