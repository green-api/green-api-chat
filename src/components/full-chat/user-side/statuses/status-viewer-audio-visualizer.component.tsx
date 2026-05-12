import { RefObject, useEffect, useRef, useState } from 'react';

interface StatusViewerAudioVisualizerProps {
  activeIndex: number;
  audioRef: RefObject<HTMLAudioElement>;
  open: boolean;
}

const StatusViewerAudioVisualizer = ({
  activeIndex,
  audioRef,
  open,
}: StatusViewerAudioVisualizerProps) => {
  const visualizerRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const [visualizerWidth, setVisualizerWidth] = useState(0);

  useEffect(() => {
    if (!open) return;

    const element = wrapRef.current;
    if (!element) return;

    const updateWidth = () => {
      setVisualizerWidth(Math.floor(element.getBoundingClientRect().width));
    };

    updateWidth();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateWidth);
      return () => {
        window.removeEventListener('resize', updateWidth);
      };
    }

    const observer = new ResizeObserver(updateWidth);
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [activeIndex, open]);

  useEffect(() => {
    if (!open || visualizerWidth <= 0) return;

    const draw = (timestamp: number) => {
      const canvas = visualizerRef.current;
      const media = audioRef.current;
      if (!canvas || !media) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = Math.max(Math.floor(rect.width * dpr), 1);
      const height = Math.max(Math.floor(rect.height * dpr), 1);

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.clearRect(0, 0, width, height);

      const barsCount = Math.min(160, Math.max(52, Math.floor(width / 6)));
      const barGap = 1.2 * dpr;
      const barWidth = Math.max((width - barGap * (barsCount - 1)) / barsCount, 1);
      const minBarHeight = 3 * dpr;
      const pausedLineHeight = 2 * dpr;
      const progressRatio = media.duration ? media.currentTime / media.duration : 0;
      const isMediaPaused = media.paused;

      for (let index = 0; index < barsCount; index += 1) {
        let amplitude = 0;

        if (!isMediaPaused) {
          const position = barsCount > 1 ? index / (barsCount - 1) : 0;
          const centerDistance = Math.abs(position - 0.5) * 2;
          const envelope = 0.34 + (1 - centerDistance) * 0.66;
          const waveA = Math.sin(timestamp * 0.0072 + index * 0.33);
          const waveB = Math.sin(timestamp * 0.0047 - index * 0.21);
          const waveC = Math.sin(timestamp * 0.0111 + index * 0.09);
          const beat = (Math.sin(timestamp * 0.0021) + 1) * 0.5;
          const motion = (waveA * 0.52 + waveB * 0.31 + waveC * 0.17 + beat * 0.22) / 1.22;
          amplitude = Math.min(0.98, Math.max(0.04, envelope * (0.36 + (motion + 1) * 0.34)));
        }

        const barHeight = isMediaPaused
          ? pausedLineHeight
          : minBarHeight + amplitude * (height - minBarHeight);
        const x = index * (barWidth + barGap);
        const y = (height - barHeight) / 2;

        ctx.fillStyle =
          index / barsCount <= progressRatio ? '#ffffff' : 'rgba(255, 255, 255, 0.36)';
        ctx.fillRect(x, y, barWidth, barHeight);
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    animationRef.current = requestAnimationFrame(draw);

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
      animationRef.current = null;
    };
  }, [activeIndex, audioRef, open, visualizerWidth]);

  return (
    <div className="status-viewer__audio-visualizer" ref={wrapRef}>
      {visualizerWidth > 0 ? (
        <canvas ref={visualizerRef} className="status-viewer__audio-canvas" />
      ) : (
        <div className="status-viewer__audio-fallback" />
      )}
    </div>
  );
};

export default StatusViewerAudioVisualizer;
