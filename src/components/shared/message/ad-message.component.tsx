import { FC } from 'react';

import { Image, Space } from 'antd';
import { useTranslation } from 'react-i18next';

import { ExtendedTextMessage } from 'types';
import { getAdMsgUrlHostname, IMAGE_FALLBACK } from 'utils';

type AdMessageProps = Pick<ExtendedTextMessage, 'sourceUrl' | 'thumbnailUrl' | 'description'>;

const AdMessage: FC<AdMessageProps> = ({ sourceUrl, thumbnailUrl, description }) => {
  const { t } = useTranslation();
  const adUrlHostname = getAdMsgUrlHostname(sourceUrl);

  return (
    <a href={sourceUrl} target="_blank" rel="noreferrer" style={{ marginTop: 10 }}>
      <Space direction="vertical" className="ad-message p-10">
        <i style={{ color: 'var(--icon-color)' }}>{t('AD_MSG_TITLE')}</i>
        <Image
          width={300}
          src={thumbnailUrl}
          style={{ borderRadius: 10 }}
          preview={false}
          alt="image"
          fallback={IMAGE_FALLBACK}
        />
        <span style={{ width: 300, fontSize: 12 }} className="text-overflow">
          {description}
        </span>
        {adUrlHostname && (
          <span className="text-overflow" style={{ width: 300 }}>
            {adUrlHostname}
          </span>
        )}
      </Space>
    </a>
  );
};

export default AdMessage;
