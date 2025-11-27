import { FC } from 'react';

import { Flex, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import ChatForm from 'components/forms/chat-form.component';
import { useAppSelector } from 'hooks';
import { useIsMaxInstance } from 'hooks/use-is-max-instance';
import { selectActiveChat } from 'store/slices/chat.slice';
import { ActiveChat } from 'types';

const ContactChatFooter: FC = () => {
  const activeChat = useAppSelector(selectActiveChat) as ActiveChat;

  const { t } = useTranslation();

  const isMax = useIsMaxInstance();

  if (activeChat.contactInfo === (isMax ? undefined : 'Error: forbidden')) {
    return (
      <Flex align="center" justify="center" className="chat-form-container text-center p-10">
        <Typography.Paragraph style={{ margin: 'initial' }}>
          {t('CANT_SEND_IN_GROUP')}
        </Typography.Paragraph>
      </Flex>
    );
  }

  return <ChatForm />;
};

export default ContactChatFooter;
