import { FC } from 'react';

import { List } from 'antd';
import { useTranslation } from 'react-i18next';

import { useActions, useAppSelector } from 'hooks';
import { selectMessageDataForRender } from 'store/slices/message-menu.slice';
import { MessageTooltipMenuData } from 'types';
import { isMessageEditable } from 'utils';

interface MessageTooltipMenuProps {
  onMenuItemClick: () => void;
}

const MessageTooltipMenu: FC<MessageTooltipMenuProps> = ({ onMenuItemClick }) => {
  const messageData = useAppSelector(selectMessageDataForRender);

  const { t } = useTranslation();

  const { setMessageMenuActiveMode, setActiveServiceMethod, setReplyMessage } = useActions();

  const getMenuData = () => {
    if (!messageData) return [];

    const menuData: MessageTooltipMenuData[] = [
      {
        key: 'messageInfo',
        label: t('MESSAGE_INFO'),
        onClick: () => setMessageMenuActiveMode('messageInfo'),
      },
      {
        key: 'reply',
        label: t('REPLY'),
        onClick: () => {
          setReplyMessage(messageData);
          onMenuItemClick();
        },
      },
    ];

    if (messageData.type === 'incoming') {
      return menuData;
    }

    if (isMessageEditable(messageData)) {
      menuData.push({
        key: 'editMessage',
        label: t('EDIT_MESSAGE'),
        onClick: () => {
          setActiveServiceMethod('editMessage');
          onMenuItemClick();
        },
      });
    }

    if (!messageData.isDeleted) {
      menuData.push({
        key: 'deleteMessage',
        label: t('DELETE_MESSAGE'),
        onClick: () => {
          setActiveServiceMethod('deleteMessage');
          onMenuItemClick();
        },
      });
    }

    return menuData;
  };

  return (
    <List
      className="message-tooltip-menu"
      dataSource={getMenuData()}
      renderItem={(item) => (
        <List.Item className="message-tooltip-menu__item" onClick={item.onClick}>
          {item.label}
        </List.Item>
      )}
    />
  );
};

export default MessageTooltipMenu;
