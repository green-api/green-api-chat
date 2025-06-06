import { FC } from 'react';

import { UploadOutlined } from '@ant-design/icons';
import { Button, Upload, message } from 'antd';
import { RcFile } from 'antd/es/upload';
import { useTranslation } from 'react-i18next';

import { useAppSelector, useActions } from 'hooks';
import { useSetGroupPictureMutation } from 'services/green-api/endpoints';
import { selectInstance } from 'store/slices/instances.slice';
import { ActiveChat } from 'types';

interface GroupAvatarUploadProps {
  activeChat: ActiveChat;
}

const GroupAvatarUpload: FC<GroupAvatarUploadProps> = ({ activeChat }) => {
  const { t } = useTranslation();
  const [setGroupPicture, { isLoading }] = useSetGroupPictureMutation();
  const instanceCredentials = useAppSelector(selectInstance);
  const { setActiveChat } = useActions();

  const handleAvatarUpload = async (file: RcFile) => {
    if (!file || !file.type.includes('image')) {
      message.error(t('INVALID_IMAGE_FILE'));
      return;
    }

    const formData = new FormData();
    formData.append('groupId', activeChat.chatId);
    formData.append('file', file);

    try {
      const { data } = await setGroupPicture({
        idInstance: instanceCredentials.idInstance.toString(),
        apiTokenInstance: instanceCredentials.apiTokenInstance,
        apiUrl: instanceCredentials.apiUrl,
        body: formData,
      });

      message.success(t('AVATAR_UPDATED'));

      if (data) {
        setActiveChat({
          ...activeChat,
          avatar: data.urlAvatar,
        });
      }
    } catch {
      message.error(t('ERROR_UPDATING_AVATAR'));
    }
  };

  return (
    <Upload
      showUploadList={false}
      beforeUpload={(file) => {
        handleAvatarUpload(file);
        return false;
      }}
      accept="image/jpeg,image/jpg"
    >
      <Button icon={<UploadOutlined />} size="small" loading={isLoading} disabled={isLoading}>
        {t('UPDATE_AVATAR')}
      </Button>
    </Upload>
  );
};

export default GroupAvatarUpload;
