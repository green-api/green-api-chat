import { FC } from 'react';

import { Card, Flex } from 'antd';

import emptyAvatar from 'assets/emptyAvatar.png';

const Chat: FC = () => {
  return (
    <Card title={<h3>Chat</h3>} extra="testExtra" className="chat">
      <Flex vertical className="contact-list">
        <Flex className="contact-list__item" align="center" gap="small">
          <img className="avatar-image" src={emptyAvatar} alt="avatar" />
          <Flex style={{ width: '100%' }} className="contact-list__item-wrapper">
            <Flex vertical gap="small" className="contact-list__item-body">
              <h6>Test Name</h6>
              <p>Test typeMessage</p>
            </Flex>
            <span>{new Date().toLocaleTimeString().slice(0, 5)}</span>
          </Flex>
        </Flex>
        <Flex className="contact-list__item" align="center" gap="small">
          <img className="avatar-image" src={emptyAvatar} alt="avatar" />
          <Flex style={{ width: '100%' }} className="contact-list__item-wrapper">
            <Flex vertical gap="small" className="contact-list__item-body">
              <h6>Test Name</h6>
              <p>Test typeMessage</p>
            </Flex>
            <span>{new Date().toLocaleTimeString().slice(0, 5)}</span>
          </Flex>
        </Flex>
        <Flex className="contact-list__item" align="center" gap="small">
          <img className="avatar-image" src={emptyAvatar} alt="avatar" />
          <Flex style={{ width: '100%' }} className="contact-list__item-wrapper">
            <Flex vertical gap="small" className="contact-list__item-body">
              <h6>Test Name</h6>
              <p>Test typeMessage</p>
            </Flex>
            <span>{new Date().toLocaleTimeString().slice(0, 5)}</span>
          </Flex>
        </Flex>
      </Flex>
    </Card>
  );
};

export default Chat;
