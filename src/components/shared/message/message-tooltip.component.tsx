import { FC, PropsWithChildren } from 'react';

import { CopyOutlined, DownOutlined } from '@ant-design/icons';
import { Flex, Tooltip } from 'antd';
import useMessage from 'antd/es/message/useMessage';
import { useTranslation } from 'react-i18next';

interface MessageTooltipProps {
  jsonMessage: string;
  isQuotedMessage?: boolean;
}

const MessageTooltip: FC<PropsWithChildren<MessageTooltipProps>> = ({
  children,
  jsonMessage,
  isQuotedMessage,
}) => {
  const { t } = useTranslation();

  const [message, contextMessageHolder] = useMessage();

  return (
    <Tooltip
      overlayInnerStyle={{
        background: 'var(--main-background)',
        color: '#000',
        overflow: isQuotedMessage ? '' : 'hidden',
        maxWidth: '100vw',
      }}
      trigger={window.outerWidth < 769 || 'cordova' in window ? 'focus' : 'hover'}
      title={
        <Flex vertical>
          <pre style={{ textWrap: 'wrap' }}>{jsonMessage}</pre>
          <div
            className="copy-massage-code-button"
            onPointerDown={() => {
              navigator.clipboard.writeText(jsonMessage).then(() => {
                message.open({
                  type: 'success',
                  content: t('TEXT_WAS_COPIED'),
                });
              });
            }}
          >
            <CopyOutlined />
          </div>
        </Flex>
      }
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
