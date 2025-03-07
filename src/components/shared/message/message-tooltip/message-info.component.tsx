import { FC } from 'react';

import { CopyOutlined } from '@ant-design/icons';
import { Flex, message } from 'antd';
import { useTranslation } from 'react-i18next';

interface MessageInfoProps {
  jsonMessage: string;
}

const MessageInfo: FC<MessageInfoProps> = ({ jsonMessage }) => {
  const { t } = useTranslation();

  return (
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
  );
};

export default MessageInfo;
