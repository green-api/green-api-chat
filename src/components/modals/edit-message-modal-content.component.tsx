import { FC } from 'react';

import { Flex } from 'antd';

import EditMessageForm from 'components/forms/edit-message-form.component';
import Message from 'components/shared/message/message.component';
import { useAppSelector } from 'hooks';
import { selectMessageDataForRender } from 'store/slices/message-menu.slice';

const EditMessageModalContent: FC = () => {
  const messageDataForRender = useAppSelector(selectMessageDataForRender);

  return (
    <Flex vertical gap={10}>
      <div className="chat-bg" style={{ borderRadius: 8 }} />
      {messageDataForRender && (
        <div style={{ alignSelf: 'center' }}>
          <Message messageDataForRender={messageDataForRender} preview />
        </div>
      )}
      <EditMessageForm />
    </Flex>
  );
};

export default EditMessageModalContent;
