import { FC } from 'react';

import { List } from 'antd';

import { useActions } from 'hooks';

const MessageTooltipMenu: FC = () => {
  const { setMessageMenuActiveMode } = useActions();

  const menuData = [
    {
      key: 'messageInfo',
      label: 'Message info',
      onClick: () => setMessageMenuActiveMode('messageInfo'),
    },
    {
      key: 'editMessage',
      label: 'Edit message',
      onClick: () => {},
    },
    {
      key: 'deleteMessage',
      label: 'Delete message',
      onClick: () => {},
    },
  ];

  return (
    <List
      className="contact-list"
      dataSource={menuData}
      renderItem={(item) => (
        <List.Item className="list-item contact-list__item" onClick={item.onClick}>
          {item.label}
        </List.Item>
      )}
    />
  );
};

export default MessageTooltipMenu;
