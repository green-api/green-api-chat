import { FC } from 'react';

import { useTranslation } from 'react-i18next';

import { PreviewCard } from './preview-card.component';
import chatBg from 'assets/chat_bg-2.png';

interface PreviewProps {
  messageFormValues: {
    typePreview: string;
    message: string;
    customPreview?: {
      title: string;
      description: string;
      urlFile?: string;
      jpegThumbnail?: string;
      link?: string;
    };
  };
  isFileMode?: boolean;
}

export const Preview: FC<PreviewProps> = ({ messageFormValues, isFileMode }) => {
  const { t } = useTranslation();

  return (
    <div className="sendMessagePreviewContainer">
      <div className="sendMessagePreviewContainer__header">{t('MESSAGE_PREVIEW')}</div>
      <img
        src={chatBg}
        width="100%"
        height="100%"
        style={{
          position: 'absolute',
          zIndex: 0,
          opacity: 'var(--chat-bg-opacity)',
          objectFit: 'cover',
        }}
      />
      <PreviewCard messageFormValues={messageFormValues} isFileMode={isFileMode} />
    </div>
  );
};
