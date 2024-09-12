import { useState } from 'react';

import { UploadOutlined } from '@ant-design/icons';
import { Button, Upload, UploadFile, UploadProps } from 'antd';
import { useTranslation } from 'react-i18next';

const UploadOneFile = (properties: Omit<UploadProps, 'onRemove' | 'beforeUpload' | 'fileList'>) => {
  const { t } = useTranslation();

  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const baseProperties: UploadProps = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = [...fileList];
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      setFileList([file]);

      return false;
    },
    fileList,
  };

  return (
    <Upload {...properties} {...baseProperties} maxCount={1}>
      <Button icon={<UploadOutlined />}>{t('SELECT_FILE')}</Button>
    </Upload>
  );
};

export default UploadOneFile;
