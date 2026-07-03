import { FC } from 'react';

import { Image, Space, Typography } from 'antd';

import { MessageProps } from './message.component';
import { getMessageTypeIcon, IMAGE_FALLBACK } from 'utils';

const FileMessage: FC<
  Pick<MessageProps['messageDataForRender'], 'downloadUrl' | 'typeMessage' | 'fileName' | 'type'>
> = ({ downloadUrl, typeMessage, fileName, type }) => {
  if (typeMessage === 'imageMessage') {
    return <Image width={300} src={downloadUrl} alt="image" fallback={IMAGE_FALLBACK} />;
  }

  return (
    <Space title={fileName || typeMessage}>
      {getMessageTypeIcon(typeMessage, downloadUrl)}
      <Typography.Paragraph
        className={`${type === 'outgoing' ? 'outgoing' : 'incoming'} full`}
        style={{ fontSize: 14, margin: 0, maxWidth: 300, fontWeight: 600 }}
        ellipsis={{ rows: 1 }}
      >
        {typeMessage}
      </Typography.Paragraph>
    </Space>
  );
};

export default FileMessage;
