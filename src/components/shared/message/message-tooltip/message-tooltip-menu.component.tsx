import { FC } from 'react';

import { List } from 'antd';
import { useTranslation } from 'react-i18next';

import MessageServiceModal from 'components/modals/message-service-modal.component';
import { useActions } from 'hooks';

const MessageTooltipMenu: FC = () => {
  const { t } = useTranslation();

  const { setMessageMenuActiveMode, setActiveServiceMethod } = useActions();

  const menuData = [
    {
      key: 'messageInfo',
      label: t('MESSAGE_INFO'),
      onClick: () => setMessageMenuActiveMode('messageInfo'),
    },
    {
      key: 'editMessage',
      label: t('EDIT_MESSAGE'),
      onClick: () => setActiveServiceMethod('editMessage'),
    },
    {
      key: 'deleteMessage',
      label: t('DELETE_MESSAGE'),
      onClick: () => {},
    },
  ];

  return (
    <>
      <List
        className="message-tooltip-menu"
        dataSource={menuData}
        renderItem={(item) => (
          <List.Item className="message-tooltip-menu__item" onClick={item.onClick}>
            {item.label}
          </List.Item>
        )}
      />
      <MessageServiceModal />
    </>
  );
};

export default MessageTooltipMenu;
