import { FC } from 'react';

import { Dropdown, MenuProps } from 'antd';
import { useTranslation } from 'react-i18next';

import AttachIcon from 'assets/attach-icon.svg?react';
import ButtonsIcon from 'assets/buttons-icon.svg?react';
import ContactIcon from 'assets/contact-icon.svg?react';
import LocationIcon from 'assets/location-icon.svg?react';
import MediaIcon from 'assets/media-icon.svg?react';
import PollIcon from 'assets/poll-icon.svg?react';
import PreviewIcon from 'assets/preview-icon.svg?react';
import MessageServiceModal from 'components/modals/message-service-modal.component';
import SendingModal from 'components/modals/sending-modal.component';
import { useActions, useAppSelector } from 'hooks';
import { useIsMaxInstance } from 'hooks/use-is-max-instance';
import i18n from 'i18n';
import { useGetProfileSettingsQuery } from 'services/app/endpoints';
import { selectUser } from 'store/slices/user.slice';
import { SendingMethodName } from 'types';

const SelectSendingMode: FC = () => {
  const { t } = useTranslation();
  const { idUser, apiTokenUser, projectId } = useAppSelector(selectUser);
  const { setActiveSendingMode } = useActions();

  const dir = i18n.dir();

  const isMax = useIsMaxInstance();

  const { data: profileSettings } = useGetProfileSettingsQuery(
    { idUser, apiTokenUser, projectId },
    { skip: !idUser || !apiTokenUser }
  );

  const isWaba = profileSettings?.result && profileSettings.data.isWaba;

  const items: MenuProps['items'] = [
    {
      key: 'sendFileByUpload',
      icon: <MediaIcon />,
      label: t('FILE'),
    },
    {
      key: 'sendContact',
      icon: <ContactIcon />,
      label: t('CONTACT'),
    },
    {
      key: 'sendLocation',
      icon: <LocationIcon />,
      label: t('LOCATION'),
    },
    {
      key: 'sendButtons',
      icon: <ButtonsIcon />,
      label: t('BUTTONS'),
    },
    {
      key: 'sendPoll',
      icon: <PollIcon />,
      label: t('POLL'),
    },
    {
      key: 'sendPreview',
      icon: <PreviewIcon />,
      label: t('PREVIEW'),
    },
  ];

  if (isWaba) {
    items.push({
      key: 'sendTemplate',
      label: <span>{t('TEMPLATE')}</span>,
    });
  }

  if (isMax) return null;

  return (
    <>
      <Dropdown
        menu={{
          items,
          onClick: ({ key }) => setActiveSendingMode(key as SendingMethodName),
        }}
        placement={dir === 'rtl' ? 'topRight' : 'topLeft'}
        trigger={['click']}
      >
        <AttachIcon style={{ cursor: 'pointer' }} height={24} width={24} />
      </Dropdown>

      <SendingModal />
      <MessageServiceModal />
    </>
  );
};

export default SelectSendingMode;
