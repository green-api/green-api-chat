import { Flex } from 'antd';

import StatusAvatar from './status-avatar.component';
import { getStatusTitle } from './status-history.utils';
import { StatusJournalItemInterface } from 'types';

interface StatusViewerHeaderProps {
  onClose: () => void;
  status: StatusJournalItemInterface;
}

const StatusViewerHeader = ({ onClose, status }: StatusViewerHeaderProps) => (
  <Flex justify="space-between" align="center" className="status-viewer__meta">
    <Flex align="center" gap={10}>
      <StatusAvatar chatId={status.chatId} className="status-viewer__avatar" size={40} />
      <div>
        <p className="status-viewer__name">{getStatusTitle(status)}</p>
        <p className="status-viewer__time">
          {new Date(status.timestamp * 1000).toLocaleTimeString()}
        </p>
      </div>
    </Flex>

    <button className="status-viewer__close" onClick={onClose}>
      ×
    </button>
  </Flex>
);

export default StatusViewerHeader;
