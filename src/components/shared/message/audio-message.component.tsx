import { FC, useEffect, useRef, useState } from 'react';

import { CaretRightFilled, PauseOutlined, LoadingOutlined } from '@ant-design/icons';
import { Avatar, Flex } from 'antd';
import { AudioVisualizer } from 'react-audio-visualize';

import { MessageProps } from './message.component';

import styles from './audio-message.module.scss';

export const AudioMessage: FC<
  Pick<MessageProps['messageDataForRender'], 'downloadUrl' | 'type'>
> = ({ downloadUrl, type }) => {
  const [blob, setBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const visualizerRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!downloadUrl) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(downloadUrl)
      .then((res) => {
        if (!res.ok) throw new Error('CORS or Network issue');
        return res.blob();
      })
      .then((audioBlob) => {
        setBlob(audioBlob);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load audio message waveform:', err);
        setLoading(false);
      });
  }, [downloadUrl]);

  useEffect(() => {
    if (!downloadUrl) return;

    const audioUrl = blob ? URL.createObjectURL(blob) : downloadUrl;
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    let rafId: number;

    const updateProgress = () => {
      if (audioRef.current) {
        setProgress(audioRef.current.currentTime);
        if (audioRef.current.duration) {
          setDuration(audioRef.current.duration);
        }
        rafId = requestAnimationFrame(updateProgress);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
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

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    if (audio.readyState >= 1) {
      setDuration(audio.duration);
    }

    return () => {
      cancelAnimationFrame(rafId);
      audio.pause();
      if (blob) {
        URL.revokeObjectURL(audioUrl);
      }
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [blob, downloadUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const isOutgoing = type === 'outgoing';
  const progressPercent = duration ? (progress / duration) * 100 : 0;

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

      <div className={styles.visualizerWrapper}>
        {!loading && (
          <div
            className={styles.baseline}
            style={{
              background: `linear-gradient(to right, ${isOutgoing ? '#008069' : '#00a884'} ${progressPercent}%, ${isOutgoing ? '#8696a0' : '#b6c5cb'} ${progressPercent}%)`,
            }}
          />
        )}
        {loading ? (
          <LoadingOutlined style={{ color: 'var(--text-color)', opacity: 0.5 }} />
        ) : blob ? (
          <div className={styles.visualizerContainer}>
            <AudioVisualizer
              ref={visualizerRef}
              blob={blob}
              width={140}
              height={36}
              barWidth={2}
              gap={0.3}
              barColor={isOutgoing ? '#8696a0' : '#b6c5cb'}
              barPlayedColor={isOutgoing ? '#008069' : '#00a884'}
              currentTime={progress}
            />
          </div>
        ) : (
          <svg width="100%" height="2" className={styles.fallbackSvg}>
            <line
              x1="0"
              y1="0"
              x2="100%"
              y2="0"
              stroke={isOutgoing ? '#8696a0' : '#b6c5cb'}
              strokeWidth="2"
              opacity="0.5"
            />
          </svg>
        )}
      </div>
    </Flex>
  );
};

export default AudioMessage;
