import { FC, useEffect, useRef, useState, memo } from 'react';

import { PlusOutlined } from '@ant-design/icons';
import { Button, Flex, Input, message } from 'antd';
import { useTranslation } from 'react-i18next';

import LizardLoader from 'components/UI/lizard-loader.component';
import { useAppSelector } from 'hooks';
import { useSendMediaStatusMutation, useUploadFileMutation } from 'services/green-api/endpoints';
import { selectInstance } from 'store/slices/instances.slice';

const { TextArea } = Input;

interface PreviewItem {
  file: File;
  url: string;
  type: string;
  name: string;
  description?: string;
}

const SendMediaStatusComponent: FC = () => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const hasOpenedRef = useRef(false);
  const [previews, setPreviews] = useState<PreviewItem[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const [uploadFile, { isLoading: isUploadFileLoading }] = useUploadFileMutation();
  const [sendMediaStatus, { isLoading: isMediaStatusLoading }] = useSendMediaStatusMutation();

  const instanceCredentials = useAppSelector(selectInstance);

  useEffect(() => {
    if (!hasOpenedRef.current) {
      hasOpenedRef.current = true;
      fileInputRef.current?.click();
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
    if (selectedFiles.length === 0) return;
    const newPreviews = selectedFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      type: file.type,
      name: file.name,
      description: '',
    }));
    setPreviews((prev) => [...prev, ...newPreviews]);
    e.target.value = '';
  };

  useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, []);

  const handleSelect = (index: number) => {
    setActiveIndex(index);
  };

  const handleDescriptionChange = (value: string) => {
    setPreviews((prev) =>
      prev.map((item, index) => (index === activeIndex ? { ...item, description: value } : item))
    );
  };

  const handleUpload = async () => {
    if (previews.length === 0) return;

    try {
      const uploadPromises = previews.map((item) =>
        uploadFile({ ...instanceCredentials, file: item.file }).unwrap()
      );

      const results = await Promise.all(uploadPromises);
      const urls = results.map((res) => res.urlFile);
      try {
        urls.forEach(async (url, index) => {
          await sendMediaStatus({
            ...instanceCredentials,
            urlFile: url,
            fileName: previews[index].name,
            caption: previews[index].description,
          });
        });
        message.success(t('SENT_STATUS_SUCCESS'));
      } catch (error) {
        console.error('Sending media status failed:', error);
      }

      console.log('Uploaded URLs in order:', urls);
      return urls;
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };
  const activePreview = previews[activeIndex];

  if (isMediaStatusLoading || isUploadFileLoading) {
    return <LizardLoader />;
  }

  return (
    <Flex
      vertical
      align="center"
      justify="space-between"
      gap={40}
      style={{
        width: '100%',
        height: '50%',
        top: '50%',
        position: 'absolute',
        transform: 'translateY(-50%)',
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {activePreview ? (
        <div style={{ width: '100%', maxWidth: 1000, textAlign: 'center' }}>
          {activePreview.type.startsWith('image/') ? (
            <img
              key={`${activePreview.url}-${activeIndex}`}
              src={activePreview.url}
              alt={activePreview.name}
              style={{
                height: 400,
                maxWidth: '80%',
                objectFit: 'contain',
                borderRadius: 12,
                margin: '0 auto',
                display: 'block',
                transition: 'opacity 0.3s ease',
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <video
              key={`${activePreview.url}-${activeIndex}`}
              src={activePreview.url}
              controls
              style={{
                height: 400,
                maxWidth: '100%',
                borderRadius: 12,
              }}
            />
          )}
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            textAlign: 'center',
            color: '#999',
            padding: '60px 0',
            cursor: 'pointer',
          }}
        >
          {t('Выберите изображение или видео')}
        </div>
      )}

      {previews.length > 0 && (
        <Flex vertical align="center" gap={16} style={{ width: '100%' }}>
          <Flex justify="center" align="center" gap={10} style={{ marginBottom: 36 }}>
            {previews.map((item, index) => {
              const isActive = index === activeIndex;
              const isImage = item.type.startsWith('image/');
              const isVideo = item.type.startsWith('video/');
              return (
                <div
                  key={index}
                  onClick={() => handleSelect(index)}
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 8,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: isActive ? '2px solid var(--primary-color)' : '1px solid #ccc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f9f9f9',
                  }}
                >
                  {isImage ? (
                    <img
                      src={item.url}
                      alt={item.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : isVideo ? (
                    <video
                      src={item.url}
                      muted
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : null}
                </div>
              );
            })}
            <Button
              type="default"
              icon={<PlusOutlined />}
              onClick={() => fileInputRef.current?.click()}
              style={{ width: 50, height: 50 }}
            />
          </Flex>
          <Flex style={{ width: '100%' }} gap={10} justify="center">
            {activePreview && (
              <TextArea
                rows={3}
                placeholder={
                  t('Введите описание (опционально)') || 'Введите описание (опционально)'
                }
                value={activePreview.description || ''}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                style={{ maxWidth: 600, borderRadius: 8 }}
              />
            )}

            <Button type="primary" onClick={handleUpload} style={{ marginTop: 20 }}>
              {t('SEND_MESSAGE')}
            </Button>
          </Flex>
        </Flex>
      )}
    </Flex>
  );
};

export const SendMediaStatus = memo(SendMediaStatusComponent);
