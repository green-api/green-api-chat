import { FC, PropsWithChildren } from 'react';

import { DownOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import useMessage from 'antd/es/message/useMessage';

import MessageInfo from './message-info.component';

interface MessageTooltipProps {
  jsonMessage: string;
  isQuotedMessage?: boolean;
}

const MessageTooltip: FC<PropsWithChildren<MessageTooltipProps>> = ({
  children,
  jsonMessage,
  isQuotedMessage,
}) => {
  const [_, contextMessageHolder] = useMessage();

  return (
    <Tooltip
      overlayInnerStyle={{
        overflow: isQuotedMessage ? '' : 'hidden',
        maxWidth: '100vw',
      }}
      trigger={isQuotedMessage ? 'hover' : 'focus'}
      title={<MessageInfo jsonMessage={jsonMessage} />}
      overlayStyle={{ maxWidth: 450, lineHeight: 'initial', fontSize: 13 }}
    >
      {!isQuotedMessage && (
        <DownOutlined
          onClick={(event) => {
            event.stopPropagation();
          }}
          className="message-arrow"
          style={{ marginTop: 6 }}
        />
      )}
      {children}
      {contextMessageHolder}
    </Tooltip>
  );
};

export default MessageTooltip;
