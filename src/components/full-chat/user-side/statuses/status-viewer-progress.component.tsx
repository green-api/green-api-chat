import type { CSSProperties } from 'react';

import { Flex } from 'antd';

import { StatusJournalItemInterface } from 'types';

interface StatusViewerProgressProps {
  activeIndex: number;
  durationMs: number;
  progressMs: number;
  statuses: StatusJournalItemInterface[];
}

const StatusViewerProgress = ({
  activeIndex,
  durationMs,
  progressMs,
  statuses,
}: StatusViewerProgressProps) => (
  <Flex gap={6} className="status-viewer__progress">
    {statuses.map((item, idx) => (
      <div key={`${item.idMessage}-${idx}`} className="status-viewer__progress-item">
        <div
          className={[
            'status-viewer__progress-fill',
            idx < activeIndex ? 'status-viewer__progress-fill--done' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          style={
            idx === activeIndex
              ? ({
                  width: `${Math.min((progressMs / Math.max(durationMs, 1)) * 100, 100)}%`,
                } as CSSProperties)
              : undefined
          }
        />
      </div>
    ))}
  </Flex>
);

export default StatusViewerProgress;
