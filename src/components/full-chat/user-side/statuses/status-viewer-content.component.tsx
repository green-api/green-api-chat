import { RefObject } from 'react';

import { Flex } from 'antd';

import { getStatusFontFamily } from './status-history.utils';
import StatusViewerAudioVisualizer from './status-viewer-audio-visualizer.component';
import { StatusJournalItemInterface } from 'types';

interface StatusViewerContentProps {
  activeIndex: number;
  audioRef: RefObject<HTMLAudioElement>;
  onMediaDurationChange: (durationMs: number) => void;
  onMediaEnded: () => void;
  open: boolean;
  status: StatusJournalItemInterface;
  videoRef: RefObject<HTMLVideoElement>;
}

const getMediaDurationMs = (duration: number) =>
  Number.isFinite(duration) && duration > 0 ? duration * 1000 : null;

const StatusViewerContent = ({
  activeIndex,
  audioRef,
  onMediaDurationChange,
  onMediaEnded,
  open,
  status,
  videoRef,
}: StatusViewerContentProps) => {
  if (status.typeMessage === 'extendedTextMessage') {
    return (
      <Flex className="status-viewer__text" align="center" justify="center">
        <p style={{ fontFamily: getStatusFontFamily(status.extendedTextMessage?.font) }}>
          {status.extendedTextMessage?.text || status.textMessage}
        </p>
      </Flex>
    );
  }

  if (status.typeMessage === 'imageMessage' && status.downloadUrl) {
    return <img className="status-viewer__media" src={status.downloadUrl} alt="status" />;
  }

  if (status.typeMessage === 'videoMessage' && status.downloadUrl) {
    return (
      <video
        ref={videoRef}
        className="status-viewer__media"
        src={status.downloadUrl}
        autoPlay
        muted
        playsInline
        onLoadedMetadata={(event) => {
          const durationMs = getMediaDurationMs(event.currentTarget.duration);
          if (durationMs !== null) {
            onMediaDurationChange(durationMs);
          }
        }}
        onEnded={onMediaEnded}
      />
    );
  }

  if (status.typeMessage === 'audioMessage' && status.downloadUrl) {
    return (
      <Flex className="status-viewer__audio-wrap" align="center" justify="center">
        <audio
          key={status.idMessage}
          ref={audioRef}
          src={status.downloadUrl}
          autoPlay
          preload="metadata"
          className="status-viewer__audio-native"
          onLoadedMetadata={(event) => {
            const durationMs = getMediaDurationMs(event.currentTarget.duration);
            if (durationMs !== null) {
              onMediaDurationChange(durationMs);
            }
          }}
          onEnded={onMediaEnded}
        />
        <StatusViewerAudioVisualizer activeIndex={activeIndex} audioRef={audioRef} open={open} />
      </Flex>
    );
  }

  return null;
};

export default StatusViewerContent;
