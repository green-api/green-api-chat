interface MessageFormValues {
  typePreview: string;
  message: string;
  customPreview?: {
    title?: string;
    description?: string;
    urlFile?: string;
    jpegThumbnail?: string;
    link?: string;
  };
}

interface PreviewCardProps {
  messageFormValues: MessageFormValues;
  isFileMode?: boolean;
}

export const PreviewCard = ({ messageFormValues }: PreviewCardProps) => {
  console.log(messageFormValues);
  const isLarge = messageFormValues?.typePreview === 'large';
  const message = messageFormValues?.message as string;
  const firstUrl = message?.match(/https?:\/\/\S+/)?.[0];
  const rawLink = (messageFormValues?.customPreview?.link as string) ?? firstUrl ?? '';
  const imageThumbnail = (messageFormValues?.customPreview?.jpegThumbnail as string) ?? '';
  const imageUrl = (messageFormValues?.customPreview?.urlFile as string) ?? '';

  let domain = '';
  try {
    const preparedLink = rawLink.startsWith('http') ? rawLink : `https://${rawLink}`;
    const url = new URL(preparedLink);
    domain = url.hostname;
  } catch {
    domain = '';
  }

  if (!message) {
    return null;
  }

  console.log(imageThumbnail, 'imageThumbnail', imageUrl, 'imageUrl');

  return (
    <div className="sendMessagePreviewCard">
      {(imageThumbnail || imageUrl) && firstUrl && (
        <div
          style={{
            display: 'flex',
            flexDirection: isLarge ? 'column' : 'row',
            backgroundColor: 'var(--message-card-description-bg)',
            borderRadius: 2,
            marginBottom: 10,
          }}
        >
          <img
            alt="image"
            src={!!imageThumbnail ? `data:image/jpeg;base64,${imageThumbnail}` : imageUrl ?? ''}
            width={isLarge ? '100%' : '90px'}
            style={{ objectFit: 'cover', aspectRatio: isLarge ? 'auto' : '1/1', maxHeight: 250 }}
          />
          <div style={{ padding: '6px 10px', overflow: 'hidden' }}>
            <div style={{ fontWeight: 600, fontSize: 13 }}>
              <span>{(messageFormValues?.customPreview?.title as string) ?? ''}</span>
            </div>
            <div style={{ fontSize: 12 }}>
              <span>{(messageFormValues.customPreview?.description as string) ?? ''}</span>
            </div>
            <div style={{ fontSize: 12, color: '#A1A1A1' }}>{domain}</div>
          </div>
        </div>
      )}
      <div style={{ wordBreak: 'break-all', fontSize: 14, overflow: 'scroll', maxHeight: 250 }}>
        {messageFormValues.message as string}
      </div>
    </div>
  );
};
