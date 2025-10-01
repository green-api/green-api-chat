import { FC } from 'react';

import { Flex, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import ChatForm from 'components/forms/chat-form.component';
import SelectSendingMode from 'components/UI/select/select-sending-mode.component';
import { useAppSelector } from 'hooks';
import { useIsMaxInstance } from 'hooks/use-is-max-instance';
import { useGetProfileSettingsQuery } from 'services/app/endpoints';
import { selectActiveChat } from 'store/slices/chat.slice';
import { selectUser } from 'store/slices/user.slice';
import { ActiveChat } from 'types';

const ContactChatFooter: FC = () => {
  const { idUser, apiTokenUser, projectId } = useAppSelector(selectUser);
  const activeChat = useAppSelector(selectActiveChat) as ActiveChat;

  const { t } = useTranslation();

  const { data: profileSettings } = useGetProfileSettingsQuery(
    { idUser, apiTokenUser, projectId },
    { skip: !idUser || !apiTokenUser }
  );

  const isMax = useIsMaxInstance();

  if (activeChat.contactInfo === (isMax ? 'groupId not found' : 'Error:forbiden')) {
    return (
      <Flex align="center" justify="center" className="chat-form-container text-center p-10">
        <Typography.Paragraph style={{ margin: 'initial' }}>
          {t('CANT_SEND_IN_GROUP')}
        </Typography.Paragraph>
      </Flex>
    );
  }

  return (
    <Flex align="center" className="chat-form-container">
      <SelectSendingMode
        isWaba={profileSettings && profileSettings.result && profileSettings.data.isWaba}
      />
      <div style={{ flex: '1' }}>
        <ChatForm />
      </div>
    </Flex>
  );
};

export default ContactChatFooter;
