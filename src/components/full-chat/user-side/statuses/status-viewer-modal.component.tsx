import { useEffect, useRef } from 'react';

import { Modal } from 'antd';

import { normalizeStatusBackgroundColor } from './status-history.utils';
import StatusViewerContent from './status-viewer-content.component';
import StatusViewerHeader from './status-viewer-header.component';
import StatusViewerProgress from './status-viewer-progress.component';
import { StatusJournalItemInterface } from 'types';

interface StatusViewerModalProps {
  activeIndex: number;
  isPaused: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onTogglePause: () => void;
  durationMs: number;
  onMediaDurationChange: (durationMs: number) => void;
  onMediaEnded: () => void;
  onMediaProgress: (progressMs: number) => void;
  open: boolean;
  progressMs: number;
  statuses: StatusJournalItemInterface[];
  nextLabel: string;
  previousLabel: string;
}

const StatusViewerModal = ({
  activeIndex,
  isPaused,
  onClose,
  onNext,
  onPrev,
  onTogglePause,
  durationMs,
  onMediaDurationChange,
  onMediaEnded,
  onMediaProgress,
  open,
  progressMs,
  statuses,
  nextLabel,
  previousLabel,
}: StatusViewerModalProps) => {
  const activeStatus = statuses[activeIndex] || null;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaProgressAnimationRef = useRef<number | null>(null);
  const isActiveVideo = activeStatus?.typeMessage === 'videoMessage' && !!activeStatus.downloadUrl;
  const isActiveAudio = activeStatus?.typeMessage === 'audioMessage' && !!activeStatus.downloadUrl;
  const isActiveMedia = isActiveVideo || isActiveAudio;

  const stageBackgroundColor =
    activeStatus?.typeMessage === 'extendedTextMessage'
      ? normalizeStatusBackgroundColor(activeStatus.extendedTextMessage?.backgroundColor)
      : '#0b141a';

  useEffect(() => {
    const media = isActiveVideo ? videoRef.current : audioRef.current;
    if (!media || !isActiveMedia) return;

    if (isPaused) {
      media.pause();
      return;
    }

    const playPromise = media.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => undefined);
    }
  }, [isPaused, activeIndex, isActiveMedia, isActiveVideo]);

  useEffect(() => {
    if (!isActiveMedia || isPaused) return;

    const syncProgress = () => {
      const media = isActiveVideo ? videoRef.current : audioRef.current;
      if (media) {
        onMediaProgress(media.currentTime * 1000);
      }
      mediaProgressAnimationRef.current = requestAnimationFrame(syncProgress);
    };

    mediaProgressAnimationRef.current = requestAnimationFrame(syncProgress);

    return () => {
      if (mediaProgressAnimationRef.current !== null) {
        cancelAnimationFrame(mediaProgressAnimationRef.current);
      }
      mediaProgressAnimationRef.current = null;
    };
  }, [isActiveMedia, isPaused, onMediaProgress, activeIndex, isActiveVideo]);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      closable={false}
      centered
      destroyOnClose
      width={1040}
      className="status-viewer"
    >
      {activeStatus && (
        <div className="status-viewer__stage" style={{ backgroundColor: stageBackgroundColor }}>
          <div className="status-viewer__top">
            <StatusViewerProgress
              activeIndex={activeIndex}
              durationMs={durationMs}
              progressMs={progressMs}
              statuses={statuses}
            />
            <StatusViewerHeader status={activeStatus} onClose={onClose} />
          </div>

          <button
            className="status-viewer__control status-viewer__control--left"
            onClick={onPrev}
            disabled={activeIndex === 0}
            aria-label={previousLabel}
          >
            ‹
          </button>

          <button
            className="status-viewer__control status-viewer__control--pause"
            onClick={onTogglePause}
            aria-label={isPaused ? 'play' : 'pause'}
          >
            {isPaused ? '▶' : '❚❚'}
          </button>

          <button
            className="status-viewer__control status-viewer__control--right"
            onClick={onNext}
            disabled={activeIndex === statuses.length - 1}
            aria-label={nextLabel}
          >
            ›
          </button>

          <StatusViewerContent
            activeIndex={activeIndex}
            audioRef={audioRef}
            onMediaDurationChange={onMediaDurationChange}
            onMediaEnded={onMediaEnded}
            open={open}
            status={activeStatus}
            videoRef={videoRef}
          />

          {activeStatus.caption && <p className="status-viewer__caption">{activeStatus.caption}</p>}
        </div>
      )}
    </Modal>
  );
};

export default StatusViewerModal;
