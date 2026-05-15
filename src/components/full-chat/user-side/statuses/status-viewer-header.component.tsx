import { useMemo } from 'react';

import { MoreOutlined } from '@ant-design/icons';
import { Dropdown, Flex, message } from 'antd';
import type { MenuProps } from 'antd';
import { useTranslation } from 'react-i18next';

import StatusAvatar from './status-avatar.component';
import { getStatusTitle } from './status-history.utils';
import { useAppSelector } from 'hooks';
import { useDeleteStatusMutation } from 'services/green-api/endpoints';
import { selectInstance } from 'store/slices/instances.slice';
import { StatusJournalItemInterface } from 'types';

interface StatusViewerHeaderProps {
  onClose: () => void;
  onStatusDeleteFailed?: (status: StatusJournalItemInterface, index: number) => void;
  onStatusDeleteOptimistic?: (statusId: string) => number;
  status: StatusJournalItemInterface;
}

const StatusViewerHeader = ({
  onClose,
  onStatusDeleteFailed,
  onStatusDeleteOptimistic,
  status,
}: StatusViewerHeaderProps) => (
  <StatusViewerHeaderInner
    onClose={onClose}
    onStatusDeleteFailed={onStatusDeleteFailed}
    onStatusDeleteOptimistic={onStatusDeleteOptimistic}
    status={status}
  />
);

const StatusViewerHeaderInner = ({
  onClose,
  onStatusDeleteFailed,
  onStatusDeleteOptimistic,
  status,
}: StatusViewerHeaderProps) => {
  const { t } = useTranslation();
  const instanceCredentials = useAppSelector(selectInstance);
  const [deleteStatus] = useDeleteStatusMutation();

  const hasDeleteOption = status.type === 'outgoing' && !!status.idMessage;
  const shouldShowMenu = hasDeleteOption;

  const handleDelete = async () => {
    if (!hasDeleteOption) return;
    const optimisticIndex = onStatusDeleteOptimistic?.(status.idMessage) ?? -1;
    try {
      await deleteStatus({
        ...instanceCredentials,
        idMessage: status.idMessage,
      }).unwrap();
      message.success(t('DELETED'));
    } catch {
      if (optimisticIndex >= 0) onStatusDeleteFailed?.(status, optimisticIndex);
      message.error(t('ERROR_DELETING_MESSAGE'));
    }
  };

  const menuItems = useMemo<MenuProps['items']>(() => {
    const items: MenuProps['items'] = [];
    if (hasDeleteOption) items.push({ key: 'delete', label: t('DELETE_MESSAGE') });
    return items;
  }, [hasDeleteOption, t]);

  const onMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'delete') void handleDelete();
  };

  return (
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

      <Flex align="center" gap={8}>
        {shouldShowMenu && (
          <Dropdown menu={{ items: menuItems, onClick: onMenuClick }} trigger={['click']}>
            <button
              type="button"
              className="status-viewer__close status-viewer__actions"
              aria-label="status-actions"
            >
              <MoreOutlined />
            </button>
          </Dropdown>
        )}
        <button type="button" className="status-viewer__close" onClick={onClose}>
          ×
        </button>
      </Flex>
    </Flex>
  );
};

export default StatusViewerHeader;
