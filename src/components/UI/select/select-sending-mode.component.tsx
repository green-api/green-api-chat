import { FC } from 'react';

import { Flex, Select } from 'antd';
import { useTranslation } from 'react-i18next';

import AttachIcon from 'assets/attach-icon.svg?react';
import ContactIcon from 'assets/contact-icon.svg?react';
import LocationIcon from 'assets/location-icon.svg?react';
import MediaIcon from 'assets/media-icon.svg?react';
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
        <Flex gap={10} align="center">
          <MediaIcon height={14} width={14} />
          {t('FILE')}
        </Flex>
      ),
    },
    {
      value: 'sendContact',
      label: (
        <Flex gap={10} align="center" style={{ padding: '6px 0 ' }}>
          <ContactIcon height={14} width={14} />
          {t('CONTACT')}
        </Flex>
      ),
    },
    {
      value: 'sendLocation',
      label: (
        <Flex gap={10} align="center" style={{ padding: '4px 0 ' }}>
          <LocationIcon height={16} width={16} />
          {t('LOCATION')}
        </Flex>
      ),
    },
    { value: 'sendPoll', label: t('POLL') },
    { value: 'sendPreview', label: t('PREVIEW') },
    { value: 'sendButtons', label: t('BUTTONS') },
  ];

  if (isWaba) {
    options.push({ value: 'sendTemplate', label: t('TEMPLATE') });
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
        dropdownStyle={{ width: 120, padding: 0 }}
        suffixIcon={<AttachIcon style={{ pointerEvents: 'none' }} />}
        onSelect={(value) => setActiveSendingMode(value as SendingMethodName)}
      />
      <SendingModal />
      <MessageServiceModal />
    </>
  );
};

export default SelectSendingMode;
