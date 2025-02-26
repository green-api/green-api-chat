import { FC, PropsWithChildren } from 'react';

import { DownOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import useMessage from 'antd/es/message/useMessage';

import MessageInfo from './message-info.component';
import MessageTooltipMenu from './message-tooltip-menu.component';
import { useActions, useAppSelector } from 'hooks';
import { selectMessageMenuActiveMode } from 'store/slices/message-menu.slice';
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

  const { setMessageDataForRender, setMessageMenuActiveMode } = useActions();

  const [_, contextMessageHolder] = useMessage();

  const onOpenChange = (visible: boolean) => {
    if (visible && !isQuotedMessage) {
      setMessageDataForRender(messageDataForRender);
    } else {
      setMessageDataForRender(null);
      setMessageMenuActiveMode('menu');
    }
  };

  return (
    <Tooltip
      trigger={isQuotedMessage ? 'hover' : 'click'}
      title={
        isQuotedMessage || tooltipMode === 'messageInfo' ? (
          <MessageInfo jsonMessage={jsonMessage} />
        ) : (
          <MessageTooltipMenu />
        )
      }
      overlayStyle={{ maxWidth: 450, lineHeight: 'initial', fontSize: 13 }}
      overlayInnerStyle={{ padding: tooltipMode === 'menu' ? '6px 0' : undefined }}
      onOpenChange={onOpenChange}
      arrow={isQuotedMessage}
      // placement="bottom"
    >
      {!isQuotedMessage && <DownOutlined className="message-arrow" style={{ marginTop: 6 }} />}
      {children}
      {contextMessageHolder}
    </Tooltip>
  );
};

export default MessageTooltip;
