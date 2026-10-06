import { ChangeEvent, FC, useEffect, useRef, useState } from 'react';

import { CaretRightFilled, PauseOutlined } from '@ant-design/icons';
import { Avatar, Flex } from 'antd';

import { MessageProps } from './message.component';
import { formatTime } from 'utils/message.utils';

import styles from './audio-message.module.scss';

export const AudioMessage: FC<
  Pick<MessageProps['messageDataForRender'], 'downloadUrl' | 'type'>
> = ({ downloadUrl, type }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedEnd, setBufferedEnd] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!downloadUrl) return;

    const audio = new Audio();
    audio.preload = 'none';
    audioRef.current = audio;

    let rafId: number;

    const updateDuration = () => {
      if (Number.isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    // End of the buffered range that contains the playhead (or 0 if nothing is buffered there)
    const updateBuffered = () => {
      const { buffered, currentTime } = audio;
      for (let i = 0; i < buffered.length; i++) {
        if (currentTime >= buffered.start(i) && currentTime <= buffered.end(i)) {
          setBufferedEnd(buffered.end(i));
          return;
        }
      }
      setBufferedEnd(0);
    };

    const updateProgress = () => {
      setProgress(audio.currentTime);
      rafId = requestAnimationFrame(updateProgress);
    };

    const handlePlay = () => {
      rafId = requestAnimationFrame(updateProgress);
      setIsPlaying(true);
    };

    const handlePause = () => {
      cancelAnimationFrame(rafId);
      setIsPlaying(false);
    };

    const handleEnded = () => {
      cancelAnimationFrame(rafId);
      setProgress(0);
      setIsPlaying(false);
    };

    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('durationchange', updateDuration);
    audio.addEventListener('progress', updateBuffered);
    audio.addEventListener('seeked', updateBuffered);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      cancelAnimationFrame(rafId);
      audio.pause();
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('durationchange', updateDuration);
      audio.removeEventListener('progress', updateBuffered);
      audio.removeEventListener('seeked', updateBuffered);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeAttribute('src');
      audio.load();
      audioRef.current = null;
    };
  }, [downloadUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      if (!audio.getAttribute('src') && downloadUrl) {
        audio.src = downloadUrl;
      }
      audio.play().catch((err) => console.error('Failed to play audio message:', err));
    }
  };

  const handleSeek = (e: ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const time = Number(e.target.value);
    audio.currentTime = time;
    setProgress(time);
  };

  const isOutgoing = type === 'outgoing';
  const progressPercent = duration ? (progress / duration) * 100 : 0;
  const bufferedPercent = duration ? Math.max((bufferedEnd / duration) * 100, progressPercent) : 0;
  const playedColor = isOutgoing ? '#008069' : '#00a884';
  const bufferedColor = isOutgoing ? '#7f9a95' : '#9aa9b0';
  const trackColor = isOutgoing ? '#b4cdb0' : '#d5dde0';

  return (
    <Flex align="center" gap={8} className={styles.audioMessageWrap}>
      <Avatar
        className={`${styles.avatar} ${isOutgoing ? styles.outgoing : styles.incoming}`}
        icon="🎧"
      />

      <div onClick={togglePlay} className={`delete-voice-status ${styles.playButtonContainer}`}>
        {isPlaying ? (
          <PauseOutlined style={{ color: isOutgoing ? '#008069' : undefined }} />
        ) : (
          <CaretRightFilled style={{ color: isOutgoing ? '#008069' : undefined }} />
        )}
      </div>

      <div className={styles.seekWrapper}>
        <input
          type="range"
          className={styles.seek}
          min={0}
          max={duration || 0}
          step="any"
          value={Math.min(progress, duration || 0)}
          disabled={!duration}
          onChange={handleSeek}
          style={{
            background: `linear-gradient(to right, ${playedColor} ${progressPercent}%, ${bufferedColor} ${progressPercent}%, ${bufferedColor} ${bufferedPercent}%, ${trackColor} ${bufferedPercent}%)`,
            color: playedColor,
          }}
        />
      </div>

      <span className={styles.time}>
        {duration ? formatTime(isPlaying || progress > 0 ? progress : duration) : '--:--'}
      </span>
    </Flex>
  );
};

export default AudioMessage;
