import { FC } from 'react';

import { AudioOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Avatar, Dropdown, MenuProps } from 'antd';
import { useTranslation } from 'react-i18next';

import emptyAvatarButAvailable from 'assets/emptyAvatarButAvailable.svg';
import MediaStatusIcon from 'assets/media-status.svg?react';
import TextStatusIcon from 'assets/text-status.svg?react';
import MessageServiceModal from 'components/modals/message-service-modal.component';
import SendingModal from 'components/modals/sending-modal.component';
import { useActions, useAppSelector } from 'hooks';
import { useInstanceSettings } from 'hooks/use-instance-settings.hook';
import { useGetAvatarQuery } from 'services/green-api/endpoints';
import { selectInstance } from 'store/slices/instances.slice';

const SelectStatusMode: FC = () => {
  const { t } = useTranslation();

  const { setIsSendingStatus } = useActions();
  const selectedInstance = useAppSelector(selectInstance);
  const { settings } = useInstanceSettings();

  const { data: avatar } = useGetAvatarQuery(
    {
      ...selectedInstance,
      chatId: `${settings?.phone}@c.us`,
    },
    {
      skip:
        !selectedInstance?.idInstance || !selectedInstance?.apiTokenInstance || !settings?.phone,
    }
  );

  const items: MenuProps['items'] = [
    {
      key: 'sendTextStatus',
      label: t('TEXT_STATUS'),
      icon: <TextStatusIcon />,
      onClick: () => setIsSendingStatus('text'),
    },
    {
      key: 'sendVoiceStatus',
      label: t('VOICE_STATUS'),
      icon: <AudioOutlined style={{ fontSize: 18 }} />,
      onClick: () => setIsSendingStatus('voice'),
    },
    {
      key: 'sendMediaStatus',
      label: t('MEDIA_STATUS'),
      icon: <MediaStatusIcon />,
      onClick: () => setIsSendingStatus('media'),
    },
  ];

  return (
    <div>
      <Dropdown
        menu={{ items }}
        overlayStyle={{ color: 'var(--icon-color)' }}
        trigger={['click']}
        placement="bottomLeft"
      >
        <div
          style={{
            display: 'flex',
            cursor: 'pointer',
            alignItems: 'center',

            justifyContent: 'center',
          }}
        >
          <span className="status-icon-wrapper" title={t('STATUSES_HEADER')}>
            <div style={{ position: 'relative' }}>
              <Avatar
                style={{ width: 45, height: 45 }}
                src={avatar?.urlAvatar?.trim() ? avatar.urlAvatar : emptyAvatarButAvailable}
              />
              <PlusCircleOutlined
                height={19}
                width={19}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 2,
                  backgroundColor: 'var(--main-background)',
                  borderRadius: '50%',
                  color: 'var(--primary-color)',
                }}
              />
            </div>
          </span>
        </div>
      </Dropdown>

      <SendingModal />
      <MessageServiceModal />
    </div>
  );
};

export default SelectStatusMode;
