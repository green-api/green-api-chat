import { FC, useEffect, useLayoutEffect, useState } from 'react';

import { Layout, message } from 'antd';
import i18n from 'i18next';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

import emptyAvatar from '../../assets/emptyAvatar.svg';
import emptyAvatarButAvailable from 'assets/emptyAvatarButAvailable.svg';
import emptyAvatarGroup from 'assets/emptyAvatarGroup.png';
import FullChat from 'components/full-chat/chat.component';
import MiniChat from 'components/mini-chat/chat.component';
import { useActions, useAppSelector } from 'hooks';
import {
  useLazyGetAvatarQuery,
  useLazyGetContactInfoQuery,
  useLazyGetGroupDataQuery,
} from 'services/green-api/endpoints';
import { selectMiniVersion, selectType } from 'store/slices/chat.slice';
import { selectUser } from 'store/slices/user.slice';
import { MessageData, MessageEventTypeEnum, TariffsEnum } from 'types';
import {
  isAuth,
  isPartnerChat,
  isValidChatType,
  isConsoleMessageData,
  getIsChatWorkingFromStorage,
  isPageInIframe,
  getErrorMessage,
  getPhoneNumberFromChatId,
} from 'utils';

const BaseLayout: FC = () => {
  const isMiniVersion = useAppSelector(selectMiniVersion);
  const type = useAppSelector(selectType);
  const user = useAppSelector(selectUser);

  const [isEventAdded, setIsEventAdded] = useState(false);

  const [searchParams] = useSearchParams();

  const { t } = useTranslation();

  const {
    setType,
    setSelectedInstance,
    setBrandData,
    setTheme,
    login,
    setPlatform,
    setActiveChat,
  } = useActions();

  const [getContactInfo] = useLazyGetContactInfoQuery();
  const [getGroupData] = useLazyGetGroupDataQuery();
  const [getAvatar] = useLazyGetAvatarQuery();

  // TODO: refactor useEffects
  useEffect(() => {
    function handleMessage(event: MessageEvent<MessageData>) {
      if (!isConsoleMessageData(event.data)) {
        return;
      }

      switch (event.data.type) {
        case MessageEventTypeEnum.INIT:
          if (event.data.payload) {
            let isChatWorking: boolean | null = null;

            if (
              event.data.payload &&
              event.data.payload?.idInstance &&
              event.data.payload.tariff === TariffsEnum.Developer
            ) {
              isChatWorking = getIsChatWorkingFromStorage(event.data.payload?.idInstance);
            }

            console.log(event.data.payload);

            setSelectedInstance({
              idInstance: event.data.payload.idInstance,
              apiTokenInstance: event.data.payload.apiTokenInstance,
              apiUrl: event.data.payload.apiUrl,
              mediaUrl: event.data.payload.mediaUrl,
              tariff: event.data.payload.tariff,
              isChatWorking: isChatWorking,
              typeInstance: event.data.payload.typeInstance,
            });
            setIsEventAdded(true);
            login({
              login: event.data.payload.login,
              idUser: event.data.payload.idUser,
              apiTokenUser: event.data.payload.apiTokenUser,
              remember: true,
              projectId: event.data.payload.projectId,
            });

            setPlatform(event.data.payload.platform);

            setTheme(event.data.payload.theme);

            return i18n.changeLanguage(event.data.payload.locale);
          }

          return;

        case MessageEventTypeEnum.SET_CREDENTIALS:
          return setSelectedInstance(event.data.payload);

        case MessageEventTypeEnum.LOCALE_CHANGE:
          return i18n.changeLanguage(event.data.payload.locale);

        case MessageEventTypeEnum.SET_THEME:
          return setTheme(event.data.payload.theme);

        default:
          return;
      }
    }

    window.addEventListener('message', handleMessage);

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useLayoutEffect(() => {
    if (searchParams.has('type')) {
      const chatType = searchParams.get('type');

      if (chatType && isValidChatType(chatType)) {
        setType(chatType);
      }
    }

    if (isPartnerChat(searchParams)) {
      const idInstance = searchParams.get('idInstance');
      const apiTokenInstance = searchParams.get('apiTokenInstance');
      const apiUrl = searchParams.get('apiUrl');
      const mediaUrl = searchParams.get('mediaUrl');

      if (!idInstance || !apiTokenInstance || !apiUrl || !mediaUrl) return;

      const language = searchParams.get('lng');

      const brandDescription = searchParams.get('dsc');
      const brandImageUrl = searchParams.get('logo');

      setType('partner-iframe');
      setSelectedInstance({
        idInstance: +idInstance,
        apiTokenInstance: apiTokenInstance,
        apiUrl: apiUrl + '/',
        mediaUrl: mediaUrl + '/',
        tariff: TariffsEnum.Business,
        typeInstance: '',
      });

      language && i18n.changeLanguage(language);

      brandDescription && setBrandData({ description: brandDescription });
      brandImageUrl && setBrandData({ brandImageUrl });

      if (searchParams.has('chatId')) {
        setType('one-chat-only');

        const chatId = searchParams.get('chatId');
        if (chatId) {
          (async () => {
            let contactInfo = undefined;
            let groupInfo = undefined;
            let avatar = chatId.includes('g.us') ? emptyAvatarGroup : emptyAvatarButAvailable;
            let error = undefined;

            if (chatId.includes('g.us') && !idInstance.toString().startsWith('7835')) {
              const { data, error: groupDataError } = await getGroupData({
                groupId: chatId,
                apiUrl: apiUrl + '/',
                mediaUrl: mediaUrl + '/',
                apiTokenInstance: apiTokenInstance,
                idInstance: +idInstance,
              });

              if (data && data !== 'Error: item-not-found') {
                groupInfo = data;
              }

              error = groupDataError;

              const { data: avatarData } = await getAvatar({
                chatId: chatId,
                apiUrl: apiUrl + '/',
                mediaUrl: mediaUrl + '/',
                apiTokenInstance: apiTokenInstance,
                idInstance: +idInstance,
              });

              if (avatarData) {
                avatar = avatarData.urlAvatar;

                if (!avatarData.available && !chatId.includes('g.us')) {
                  avatar = emptyAvatar;
                }
              }
            }

            if (!chatId.includes('g.us') && !idInstance.toString().startsWith('7835')) {
              const { data, error: contactInfoError } = await getContactInfo({
                chatId,
                apiUrl: apiUrl + '/',
                mediaUrl: mediaUrl + '/',
                apiTokenInstance: apiTokenInstance,
                idInstance: +idInstance,
              });

              contactInfo = data;

              if (contactInfo?.avatar) {
                avatar = contactInfo.avatar;
              }

              error = contactInfoError;
            }

            if (error) {
              message.error(getErrorMessage(error, t), 0);
              return;
            }

            const senderName =
              (typeof groupInfo === 'object' &&
                groupInfo !== null &&
                'subject' in groupInfo &&
                groupInfo.subject) ||
              contactInfo?.contactName ||
              contactInfo?.name ||
              getPhoneNumberFromChatId(chatId);

            setActiveChat({
              chatId,
              senderName,
              avatar,
              contactInfo: groupInfo || contactInfo,
            });
          })();
        }
      }
    }
  }, [searchParams]);

  useEffect(() => {
    const isNotAuthorized = !isAuth(user);
    const isNotPartner = !isPartnerChat(searchParams);
    const isNotIframe = !isPageInIframe();

    const shouldThrowOnMini = isNotAuthorized && !isMiniVersion && isNotPartner && isEventAdded;
    const shouldThrowOnTab = isNotAuthorized && isNotPartner && isNotIframe && type === 'tab';

    if (shouldThrowOnMini || shouldThrowOnTab) {
      throw new Error('NO_INSTANCE_CREDENTIALS');
    }
  }, [user, isMiniVersion, searchParams, isEventAdded, type]);

  return (
    <Layout className={`app ${!isMiniVersion ? 'bg' : ''}`}>
      <Layout.Content className={`main ${!isMiniVersion ? 'flex-center' : ''}`}>
        {isMiniVersion ? <MiniChat /> : <FullChat />}
      </Layout.Content>
    </Layout>
  );
};

export default BaseLayout;
