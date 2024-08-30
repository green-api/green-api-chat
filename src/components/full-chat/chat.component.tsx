import { FC } from 'react';

import { Card, Flex } from 'antd';

import ContactList from '../shared/contact-list.component';

const Chat: FC = () => {
  return (
    <Card className="full-chat" bordered={false}>
      <Flex vertical style={{ maxWidth: '30%' }}>
        <ContactList />
      </Flex>
    </Card>
  );
};

export default Chat;
