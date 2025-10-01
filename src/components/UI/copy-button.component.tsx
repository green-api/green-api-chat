import { memo } from 'react';

import { CopyOutlined } from '@ant-design/icons';
import useMessage from 'antd/es/message/useMessage';
import { useTranslation } from 'react-i18next';

const CopyButton = memo(
  ({ text, additionalClassname }: { text: string; additionalClassname?: string }) => {
    const { t } = useTranslation();

    const [message, contextMessageHolder] = useMessage();

    return (
      <>
        <CopyOutlined
          title={t('COPY_IN_BUFFER')}
          onClick={(event) => {
            event.stopPropagation();

            navigator.clipboard.writeText(text).then(() => {
              message.open({
                type: 'success',
                content: t('TEXT_WAS_COPIED'),
              });
            });
          }}
          className={`icon-button ${additionalClassname ?? ''}`}
        />
        {contextMessageHolder}
      </>
    );
  }
);

export default CopyButton;
