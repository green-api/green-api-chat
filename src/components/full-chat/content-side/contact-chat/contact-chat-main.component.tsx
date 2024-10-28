import { FC } from 'react';

import { Flex } from 'antd';

import ContactChatHeader from './contact-chat-header.component';
import ChatForm from 'components/forms/chat-form.component';
import ChatView from 'components/shared/chat-view.component';
import SelectSendingMode from 'components/UI/select/select-sending-mode.component';
import { useAppSelector, useMediaQuery } from 'hooks';
import { useGetProfileSettingsQuery } from 'services/app/endpoints';
import { selectActiveChat, selectIsContactInfoOpen } from 'store/slices/chat.slice';
import { selectUser } from 'store/slices/user.slice';
import { ActiveChat } from 'types';

const ContactChatMain: FC = () => {
  const { idUser, apiTokenUser } = useAppSelector(selectUser);
  const isContactInfoOpen = useAppSelector(selectIsContactInfoOpen);
  const activeChat = useAppSelector(selectActiveChat) as ActiveChat;

  const matchMedia = useMediaQuery('(max-width: 1150px)');

  const { data: profileSettings } = useGetProfileSettingsQuery(
    { idUser, apiTokenUser },
    { skip: !idUser || !apiTokenUser }
  );

  return (
    <Flex vertical className={`w-100 ${matchMedia && isContactInfoOpen ? 'display-none' : ''}`}>
      <div className="chat-bg" />
      <ContactChatHeader />
      <ChatView key={activeChat.chatId} />
      <Flex align="center" className="chat-form-container">
        <SelectSendingMode
          isWaba={profileSettings && profileSettings.result && profileSettings.data.isWaba}
        />
        <div style={{ flex: '1' }}>
          <ChatForm />
        </div>
      </Flex>
    </Flex>
  );
};

export default ContactChatMain;
