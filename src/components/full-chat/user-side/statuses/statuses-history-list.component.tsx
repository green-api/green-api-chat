import type { ReactNode } from 'react';

import { Flex, List } from 'antd';
import { useTranslation } from 'react-i18next';

import StatusAvatar from './status-avatar.component';
import {
  formatStatusDate,
  getStatusText,
  normalizeStatusBackgroundColor,
} from './status-history.utils';
import type { StatusContactGroup } from './use-statuses-history.hook';
import type { StatusJournalItemInterface } from 'types';

interface StatusesHistoryListProps {
  groups: StatusContactGroup[];
  onOpenGroup: (statuses: StatusJournalItemInterface[]) => void;
}

const getStatusListPreviewNode = (status: StatusJournalItemInterface): ReactNode => {
  if (status.typeMessage === 'imageMessage' && status.downloadUrl) {
    return (
      <img className="status-history__preview-avatar-media" src={status.downloadUrl} alt="status" />
    );
  }

  if (status.typeMessage === 'videoMessage' && status.downloadUrl) {
    return (
      <video
        className="status-history__preview-avatar-media"
        src={status.downloadUrl}
        muted
        playsInline
        preload="metadata"
      />
    );
  }

  if (status.typeMessage === 'extendedTextMessage') {
    return (
      <div
        className="status-history__preview-avatar-text"
        style={{
          backgroundColor: normalizeStatusBackgroundColor(
            status.extendedTextMessage?.backgroundColor
          ),
        }}
      >
        {status.extendedTextMessage?.text || status.textMessage || ''}
      </div>
    );
  }

  return null;
};

const StatusesHistoryList = ({ groups, onOpenGroup }: StatusesHistoryListProps) => {
  const { t } = useTranslation();

  return (
    <List
      className="status-history__list"
      dataSource={groups}
      renderItem={(group) => (
        <List.Item
          className="status-history__item status-history__item--grouped"
          onClick={() => onOpenGroup(group.statuses)}
        >
          <List.Item.Meta
            avatar={
              <StatusAvatar
                chatId={group.chatId}
                className="status-history__avatar"
                size={48}
                segments={group.statuses.length}
                previewNode={getStatusListPreviewNode(group.latestStatus)}
              />
            }
            title={group.title}
            description={
              <Flex vertical>
                <span className="status-history__preview">{getStatusText(group.latestStatus)}</span>
                <span className="status-history__date">
                  {formatStatusDate(group.latestStatus.timestamp)}
                </span>
              </Flex>
            }
          />
        </List.Item>
      )}
    />
  );
};

export default StatusesHistoryList;
