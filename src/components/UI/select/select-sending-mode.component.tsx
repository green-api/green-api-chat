import { FC } from 'react';

import { Flex, Select } from 'antd';
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
import { useActions } from 'hooks';
import { useIsMaxInstance } from 'hooks/use-is-max-instance';
import { SendingMethodName } from 'types';

interface SelectSendingModeProps {
  isWaba?: boolean;
}

const SelectSendingMode: FC<SelectSendingModeProps> = ({ isWaba }) => {
  const { t, i18n } = useTranslation();

  const { setActiveSendingMode } = useActions();

  const dir = i18n.dir();

  const isMax = useIsMaxInstance();

  const options = [
    {
      value: 'sendFileByUpload',
      label: (
        <Flex gap={15} align="center">
          <MediaIcon />
          {t('FILE')}
        </Flex>
      ),
    },
    {
      value: 'sendContact',
      label: (
        <Flex gap={15} align="center">
          <ContactIcon style={{ padding: '8px 0 ' }} />
          {t('CONTACT')}
        </Flex>
      ),
    },
    {
      value: 'sendLocation',
      label: (
        <Flex gap={15} align="center" style={{ padding: '4px 0 ' }}>
          <LocationIcon />
          {t('LOCATION')}
        </Flex>
      ),
    },
    {
      value: 'sendButtons',
      label: (
        <Flex gap={15} align="center">
          <ButtonsIcon />
          {t('BUTTONS')}
        </Flex>
      ),
    },
    {
      value: 'sendPoll',
      label: (
        <Flex gap={15} align="center">
          <PollIcon />
          {t('POLL')}
        </Flex>
      ),
    },
    {
      value: 'sendPreview',
      label: (
        <Flex gap={15} align="center">
          <PreviewIcon />
          {t('PREVIEW')}
        </Flex>
      ),
    },
  ];

  if (isWaba) {
    options.push({
      value: 'sendTemplate',
      label: <span>{t('TEMPLATE')}</span>,
    });
  }
  if (isMax) return null;
  return (
    <>
      <Select
        className={`select-sending-mode ${dir === 'rtl' ? 'rtl' : ''}`}
        variant="borderless"
        value=""
        options={options}
        style={{ width: 50 }}
        dropdownStyle={{ width: 150, padding: 0 }}
        suffixIcon={<AttachIcon style={{ pointerEvents: 'none' }} />}
        onSelect={(value) => setActiveSendingMode(value as SendingMethodName)}
      />
      <SendingModal />
      <MessageServiceModal />
    </>
  );
};

export default SelectSendingMode;
