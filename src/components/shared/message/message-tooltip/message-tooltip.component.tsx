import { FC, PropsWithChildren, useState } from 'react';

import { DownOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import useMessage from 'antd/es/message/useMessage';

import MessageInfo from './message-info.component';
import MessageTooltipMenu from './message-tooltip-menu.component';
import { useActions, useAppSelector } from 'hooks';
import { selectMiniVersion } from 'store/slices/chat.slice';
import {
  selectActiveServiceMethod,
  selectMessageMenuActiveMode,
} from 'store/slices/message-menu.slice';
import { MessageDataForRender } from 'types';

interface MessageTooltipProps {
  messageDataForRender: MessageDataForRender;
  jsonMessage: string;
  isQuotedMessage?: boolean;
}

const MessageTooltip: FC<PropsWithChildren<MessageTooltipProps>> = ({
  children,
  messageDataForRender,
  jsonMessage,
  isQuotedMessage,
}) => {
  const tooltipMode = useAppSelector(selectMessageMenuActiveMode);
  const activeServiceMethod = useAppSelector(selectActiveServiceMethod);
  const isMiniVersion = useAppSelector(selectMiniVersion);

  const { setMessageDataForRender, setMessageMenuActiveMode } = useActions();

  const [_, contextMessageHolder] = useMessage();

  const [visible, setIsVisible] = useState(false);

  const onOpenChange = (visible: boolean) => {
    if (visible && !isQuotedMessage) {
      setMessageDataForRender(messageDataForRender);
    }

    if (!visible && !activeServiceMethod) {
      setMessageMenuActiveMode('menu');
    }

    setIsVisible(visible);
  };

  return (
    <Tooltip
      trigger={isQuotedMessage || isMiniVersion ? 'hover' : 'click'}
      title={
        isQuotedMessage || tooltipMode === 'messageInfo' || isMiniVersion ? (
          <MessageInfo jsonMessage={jsonMessage} />
        ) : (
          <MessageTooltipMenu onMenuItemClick={() => setIsVisible(false)} />
        )
      }
      overlayStyle={{ maxWidth: 450, lineHeight: 'initial', fontSize: 13 }}
      onOpenChange={onOpenChange}
      arrow={isQuotedMessage || isMiniVersion}
      open={visible}
    >
      {!isQuotedMessage && (
        <DownOutlined
          className={`message-arrow ${visible ? 'visible' : ''}`}
          style={{ marginTop: 6 }}
        />
      )}
      {children}
      {contextMessageHolder}
    </Tooltip>
  );
};

export default MessageTooltip;
