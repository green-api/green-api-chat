import { FC, useEffect, useState } from 'react';

import { DeleteOutlined } from '@ant-design/icons';
import { Button, Form, Input, Tabs, Upload, message, Space, Flex } from 'antd';
import { FormInstance, useWatch } from 'antd/es/form/Form';
import { useTranslation } from 'react-i18next';

import { useAppSelector } from 'hooks';
import { useUploadFileMutation } from 'services/green-api/endpoints';
import { selectInstance } from 'store/slices/instances.slice';
import { formDefaultLayout, formItemDefaultLayout } from 'configs';

interface FileOrUrlInputProps {
  namePrefix: (string | number)[];
  form: FormInstance;
  isBigPreview?: boolean;
}

export const PreviewImageInput: FC<FileOrUrlInputProps> = ({ namePrefix, form, isBigPreview }) => {
  const { t } = useTranslation();
  const [isFileMode, setIsFileMode] = useState(true);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [uploadFile] = useUploadFileMutation();
  const { apiTokenInstance, apiUrl, mediaUrl, idInstance } = useAppSelector(selectInstance);

  const watchedUrl = useWatch([...namePrefix, 'urlFile'], form);

  useEffect(() => {
    if (!isFileMode && watchedUrl) {
      form.setFieldsValue({
        [namePrefix.join('.')]: { urlFile: watchedUrl },
      });
    }
  }, [watchedUrl, isFileMode, form, namePrefix]);

  const handleFileChange = async (file: File) => {
    if (isBigPreview) {
      setUploading(true);
      try {
        const response = await uploadFile({
          file: file,
          apiTokenInstance: apiTokenInstance,
          apiUrl: apiUrl,
          mediaUrl: mediaUrl,
          idInstance: idInstance,
        }).unwrap();
        const url = response.urlFile;

        setFileUrl(url);
        form.setFieldsValue({
          [namePrefix.join('.')]: { urlFile: url },
        });

        setUploadedFile(file);
      } catch (error) {
        message.error(t('FILE_UPLOAD_ERROR'));
      } finally {
        setUploading(false);
      }
    } else {
      try {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
          setFileBase64(base64);

          form.setFieldsValue({
            [namePrefix.join('.')]: { jpegThumbnail: base64 },
          });

          setUploadedFile(file);
        };
        reader.readAsDataURL(file);
      } catch {
        message.error(t('FILE_UPLOAD_ERROR'));
      }
    }
  };

  const handleBeforeUpload = (file: File) => {
    if (file.size > 102_400) {
      message.error(t('FILE_TOO_LARGE'));
      return Upload.LIST_IGNORE;
    }

    handleFileChange(file);
    return false;
  };

  const handleFileRemove = () => {
    setUploadedFile(null);
    setFileUrl(null);
    setFileBase64(null);
    form.setFieldsValue({
      [namePrefix.join('.')]: { jpegThumbnail: undefined, urlFile: undefined },
    });
  };

  return (
    <>
      <Form.Item label={t('PREVIEW_IMAGE')}>
        <Tabs
          activeKey={isFileMode ? 'file' : 'url'}
          type="card"
          size="small"
          className="w-100"
          onChange={(key) => {
            setIsFileMode(key === 'file');
            if (key !== 'file') setFileBase64(null);
          }}
        >
          <Tabs.TabPane tab={t('FILE')} key="file" />
          <Tabs.TabPane tab={t('URL')} key="url" />
        </Tabs>

        {isFileMode ? (
          <Flex gap={8} align="center" className="w-100">
            <Upload
              style={{ width: '200px', display: 'block' }}
              accept="image/jpeg"
              maxCount={1}
              showUploadList={false}
              beforeUpload={handleBeforeUpload}
            >
              <div
                style={{
                  width: '250px',
                  flex: '1 1 100%',
                  padding: 12,
                  borderRadius: '0 4px 4px 4px',
                  border: '1px solid var(--message-queue-border)',
                }}
              >
                {!uploadedFile ? (
                  <Button type="primary" block loading={uploading}>
                    {uploading ? t('UPLOADING') : t('UPLOAD_FILE')}
                  </Button>
                ) : (
                  <Input readOnly value={uploadedFile.name} />
                )}
              </div>
            </Upload>

            {uploadedFile && (
              <Button
                icon={<DeleteOutlined />}
                style={{ flex: '0 0 35px' }}
                onClick={handleFileRemove}
              />
            )}
          </Flex>
        ) : (
          <Form.Item
            name={[...namePrefix, 'urlFile']}
            rules={[{ required: !isFileMode, message: t('PREVIEW_IMAGE_REQUIRED') }]}
          >
            <Input placeholder={t('ENTER_IMAGE_URL')} />
          </Form.Item>
        )}
      </Form.Item>

      {isFileMode && !isBigPreview && fileBase64 && (
        <Form.Item key="jpegThumbnail" name={[...namePrefix, 'jpegThumbnail']} hidden>
          <Input readOnly value={uploadedFile?.name} />
        </Form.Item>
      )}

      {isFileMode && isBigPreview && fileUrl && (
        <Form.Item key="urlFile" name={[...namePrefix, 'urlFile']} initialValue={fileUrl} hidden />
      )}
    </>
  );
};
