import { Empty, Flex, Spin } from 'antd';
import { useTranslation } from 'react-i18next';

import StatusViewerModal from './status-viewer-modal.component';
import StatusesHistoryList from './statuses-history-list.component';
import { useStatusViewer } from './use-status-viewer.hook';
import { useStatusesHistory } from './use-statuses-history.hook';

const StatusesHistory = () => {
  const { t } = useTranslation();
  const { groupedStatuses, hasError, isFetching, isLoading } = useStatusesHistory();
  const viewer = useStatusViewer();
  const showInitialLoader = groupedStatuses.length === 0 && (isLoading || isFetching);

  return (
    <Flex vertical gap={12} className="status-history">
      <p className="status-history__title">{t('STATUS_LIST')}</p>

      {showInitialLoader && (
        <Flex justify="center" className="status-history__loading">
          <Spin />
        </Flex>
      )}

      {hasError && <p className="status-history__error">{t('STATUS_HISTORY_ERROR')}</p>}

      {!showInitialLoader && !hasError && groupedStatuses.length === 0 && (
        <Empty description={t('NO_STATUSES_FOUND')} image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}

      {!hasError && groupedStatuses.length > 0 && (
        <StatusesHistoryList groups={groupedStatuses} onOpenGroup={viewer.openViewerForContact} />
      )}

      <StatusViewerModal
        open={viewer.isViewerOpen}
        statuses={viewer.viewerStatuses}
        activeIndex={viewer.activeIndex}
        progressMs={viewer.progressMs}
        durationMs={viewer.activeDurationMs}
        isPaused={viewer.isPaused}
        onClose={viewer.closeViewer}
        onPrev={viewer.goPrev}
        onNext={viewer.goNext}
        onTogglePause={viewer.togglePause}
        onMediaDurationChange={viewer.handleMediaDurationChange}
        onMediaProgress={viewer.handleMediaProgress}
        onMediaEnded={viewer.goNext}
        previousLabel={t('PREVIOUS')}
        nextLabel={t('NEXT')}
      />
    </Flex>
  );
};

export default StatusesHistory;
