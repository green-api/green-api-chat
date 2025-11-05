import { FC, useEffect, useRef, useState, memo } from 'react';

import { PlusOutlined, CloseOutlined, SendOutlined } from '@ant-design/icons';
import { Button, Flex, Form, Input, message } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { useTranslation } from 'react-i18next';

import { CloseStatus } from './close-status.component';
import Participants from 'components/forms/statuses/participants.component';
import LizardLoader from 'components/UI/lizard-loader.component';
import { useAppSelector } from 'hooks';
import { useSendMediaStatusMutation, useUploadFileMutation } from 'services/green-api/endpoints';
import { selectInstance } from 'store/slices/instances.slice';

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [form] = useForm();
  const participants = Form.useWatch('participants', form);

  const [uploadFile] = useUploadFileMutation();
  const [sendMediaStatus] = useSendMediaStatusMutation();
  const instanceCredentials = useAppSelector(selectInstance);

  useEffect(() => {
    if (!hasOpenedRef.current) {
      hasOpenedRef.current = true;
      fileInputRef.current?.click();
    }
  }, []);

  const MAX_PREVIEWS = 100;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
    if (selectedFiles.length === 0) return;

    setPreviews((prev) => {
      const availableSlots = MAX_PREVIEWS - prev.length;

      if (availableSlots <= 0) {
        message.warning(t('Вы не можете добавить больше 100 файлов'));
        e.target.value = '';
        return prev;
      }

      const allowedFiles = selectedFiles.slice(0, availableSlots);

      const newPreviews = allowedFiles.map((file) => ({
        file,
        url: URL.createObjectURL(file),
        type: file.type,
        name: file.name,
        description: '',
      }));

      return [...prev, ...newPreviews];
    });

    e.target.value = '';
  };

  useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, []);

  const handleSelect = (index: number) => setActiveIndex(index);

  const handleDescriptionChange = (value: string) => {
    setPreviews((prev) =>
      prev.map((item, index) => (index === activeIndex ? { ...item, description: value } : item))
    );
  };

  const handleRemove = (index: number) => {
    setPreviews((prev) => {
      const newList = prev.filter((_, i) => i !== index);
      if (activeIndex >= newList.length) {
        setActiveIndex(Math.max(newList.length - 1, 0));
      }
      return newList;
    });
  };

  const handleUpload = async () => {
    setIsProcessing(true);

    try {
      const UPLOAD_BATCH_SIZE = 50;
      const SEND_BATCH_SIZE = 5;

      const uploadBatches = [];
      for (let i = 0; i < previews.length; i += UPLOAD_BATCH_SIZE) {
        uploadBatches.push(previews.slice(i, i + UPLOAD_BATCH_SIZE));
      }

      const uploadedUrls: string[] = [];

      for (const batch of uploadBatches) {
        const uploadPromises = batch.map((item) =>
          uploadFile({ ...instanceCredentials, file: item.file }).unwrap()
        );

        const results = await Promise.allSettled(uploadPromises);

        const fulfilledResults = results.filter(
          (res): res is PromiseFulfilledResult<{ urlFile: string }> =>
            res.status === 'fulfilled' && !!res.value?.urlFile
        );

        uploadedUrls.push(...fulfilledResults.map((res) => res.value.urlFile));

        if (batch !== uploadBatches[uploadBatches.length - 1]) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      if (uploadedUrls.length === 0) {
        message.error(t('UPLOAD_FAILED'));
        return;
      }

      const sendBatches = [];
      for (let i = 0; i < uploadedUrls.length; i += SEND_BATCH_SIZE) {
        sendBatches.push(uploadedUrls.slice(i, i + SEND_BATCH_SIZE));
      }

      let totalSent = 0;

      const mappedParticipants = participants?.map((participant: string) => {
        const cleaned = participant.trim();
        return cleaned.endsWith('@c.us') ? cleaned : `${cleaned}@c.us`;
      });

      for (const [batchIndex, batch] of sendBatches.entries()) {
        const sendPromises = batch.map((url, idx) =>
          sendMediaStatus({
            ...instanceCredentials,
            urlFile: url,
            fileName: previews[batchIndex * SEND_BATCH_SIZE + idx].name,
            caption: previews[batchIndex * SEND_BATCH_SIZE + idx].description,
            participants:
              mappedParticipants && mappedParticipants.length > 0 ? mappedParticipants : undefined,
          })
        );

        const sendResults = await Promise.allSettled(sendPromises);
        totalSent += sendResults.filter((r) => r.status === 'fulfilled').length;

        if (batch !== sendBatches[sendBatches.length - 1]) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      if (totalSent > 0) {
        message.success(t('SENT_STATUS_SUCCESS'));
      } else {
        message.error(t('SENT_STATUS_FAILED'));
      }
    } catch (error) {
      console.error('Upload process failed:', error);
      message.error(t('UPLOAD_FAILED'));
    } finally {
      setIsProcessing(false);
    }
  };

  const activePreview = previews[activeIndex];

  if (isProcessing) {
    return <LizardLoader />;
  }

  return (
    <Flex className="send-media" vertical align="center" justify="center">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="send-media__input"
        onChange={handleFileChange}
      />
      <CloseStatus />

      <div className="send-media__center">
        {activePreview ? (
          <div className="send-media__preview">
            {activePreview.type.startsWith('image/') ? (
              <img
                key={`${activePreview.url}-${activeIndex}`}
                src={activePreview.url}
                alt={activePreview.name}
                className="send-media__image"
                onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
              />
            ) : (
              <video
                key={`${activePreview.url}-${activeIndex}`}
                src={activePreview.url}
                controls
                className="send-media__video"
              />
            )}
          </div>
        ) : (
          <div className="send-media__empty" onClick={() => fileInputRef.current?.click()}>
            {t('Выберите изображение или видео')}
          </div>
        )}

        {previews.length > 0 && (
          <Flex justify="center" align="center" gap={10} className="send-media__thumbnails">
            {previews.map((item, index) => {
              const isActive = index === activeIndex;
              const isImage = item.type.startsWith('image/');
              const isVideo = item.type.startsWith('video/');

              return (
                <div
                  key={index}
                  className={`send-media__thumb ${isActive ? 'active' : ''}`}
                  onClick={() => handleSelect(index)}
                >
                  <button
                    className="send-media__remove-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(index);
                    }}
                  >
                    <CloseOutlined />
                  </button>

                  {isImage ? (
                    <img src={item.url} alt={item.name} />
                  ) : isVideo ? (
                    <video src={item.url} muted />
                  ) : null}
                </div>
              );
            })}
            <Button
              type="default"
              icon={<PlusOutlined />}
              onClick={() => fileInputRef.current?.click()}
              className="send-media__add-btn"
              disabled={previews.length >= MAX_PREVIEWS}
            />
          </Flex>
        )}
      </div>
      <div className="send-media__bottom">
        {activePreview && (
          <Form form={form}>
            <Participants />
          </Form>
        )}
        <Flex justify="center" align="center" gap={10}>
          {activePreview && (
            <Input
              placeholder={t('Введите описание (опционально)') || 'Введите описание (опционально)'}
              value={activePreview.description || ''}
              onChange={(e) => handleDescriptionChange(e.target.value)}
            />
          )}
          {activePreview && (
            <Button
              htmlType="submit"
              size="large"
              type="primary"
              shape="circle"
              style={{ width: 40, height: 40 }}
              icon={<SendOutlined />}
              onClick={handleUpload}
              className="send-media__send-btn"
            ></Button>
          )}
        </Flex>
      </div>
    </Flex>
  );
};

export const SendMediaStatus = memo(SendMediaStatusComponent);
