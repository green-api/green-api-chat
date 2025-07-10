import { FC } from 'react';

import { Dropdown, MenuProps } from 'antd';
import { useTranslation } from 'react-i18next';

import StatusIcon from 'assets/status.svg?react';
import MessageServiceModal from 'components/modals/message-service-modal.component';
import SendingModal from 'components/modals/sending-modal.component';
import { useActions } from 'hooks';

const SelectStatusMode: FC = () => {
  const { t } = useTranslation();
  const { setActiveSendingMode } = useActions();

  const items: MenuProps['items'] = [
    {
      key: 'sendTextStatus',
      label: t('TEXT_STATUS'),
      onClick: () => setActiveSendingMode('sendTextStatus'),
    },
    {
      key: 'sendVoiceStatus',
      label: t('VOICE_STATUS'),
      onClick: () => setActiveSendingMode('sendVoiceStatus'),
    },
    {
      key: 'sendMediaStatus',
      label: t('MEDIA_STATUS'),
      onClick: () => setActiveSendingMode('sendMediaStatus'),
    },
  ];

  return (
    <div>
      <Dropdown menu={{ items }} trigger={['click']} placement="bottomLeft">
        <div
          style={{
            display: 'flex',
            cursor: 'pointer',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span className="status-icon-wrapper" title={t('STATUSES_HEADER')}>
            <StatusIcon className="status-icon" />
          </span>
        </div>
      </Dropdown>

      <SendingModal />
      <MessageServiceModal />
    </div>
  );
};

export default SelectStatusMode;
