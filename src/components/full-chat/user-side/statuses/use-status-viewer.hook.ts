import { useCallback, useEffect, useRef, useState } from 'react';

import { load as loadFont } from 'webfontloader';

import { VIEW_TIMEOUT_MS } from './status-history.utils';
import type { StatusJournalItemInterface } from 'types';

const isMediaStatus = (status?: StatusJournalItemInterface | null) =>
  (status?.typeMessage === 'videoMessage' || status?.typeMessage === 'audioMessage') &&
  !!status.downloadUrl;

export const useStatusViewer = () => {
  const [areFontsLoaded, setAreFontsLoaded] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [progressMs, setProgressMs] = useState(0);
  const [activeDurationMs, setActiveDurationMs] = useState(VIEW_TIMEOUT_MS);
  const [viewerStatuses, setViewerStatuses] = useState<StatusJournalItemInterface[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);

  const activeStatus = viewerStatuses[activeIndex] || null;
  const isActiveMedia = isMediaStatus(activeStatus);

  const goPrev = useCallback(() => {
    setActiveIndex((prev) => Math.max(prev - 1, 0));
    setProgressMs(0);
    setActiveDurationMs(VIEW_TIMEOUT_MS);
  }, []);

  const goNext = useCallback(() => {
    setActiveIndex((prev) => {
      if (prev + 1 >= viewerStatuses.length) {
        setIsViewerOpen(false);
        return prev;
      }

      return prev + 1;
    });
    setProgressMs(0);
    setActiveDurationMs(VIEW_TIMEOUT_MS);
  }, [viewerStatuses.length]);

  const closeViewer = useCallback(() => {
    setIsViewerOpen(false);
    setIsPaused(false);
    setActiveIndex(0);
    setProgressMs(0);
    setActiveDurationMs(VIEW_TIMEOUT_MS);
    setViewerStatuses([]);
  }, []);

  const openViewerForContact = useCallback((statuses: StatusJournalItemInterface[]) => {
    setViewerStatuses(statuses);
    setActiveIndex(0);
    setIsViewerOpen(true);
    setIsPaused(false);
    setProgressMs(0);
    setActiveDurationMs(VIEW_TIMEOUT_MS);
  }, []);

  const togglePause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  const removeStatusOptimistically = useCallback((statusId: string) => {
    let removedIndex = -1;

    setViewerStatuses((prev) => {
      removedIndex = prev.findIndex((item) => item.idMessage === statusId);
      if (removedIndex < 0) return prev;
      return prev.filter((item) => item.idMessage !== statusId);
    });

    setActiveIndex((prev) => {
      if (removedIndex < 0) return prev;
      if (viewerStatuses.length <= 1) return 0;
      if (prev > removedIndex) return prev - 1;
      if (prev >= viewerStatuses.length - 1) return Math.max(viewerStatuses.length - 2, 0);
      return prev;
    });

    return removedIndex;
  }, [viewerStatuses.length]);

  const restoreDeletedStatus = useCallback((status: StatusJournalItemInterface, index: number) => {
    setViewerStatuses((prev) => {
      const next = [...prev];
      next.splice(Math.max(index, 0), 0, status);
      return next;
    });
  }, []);

  const handleMediaDurationChange = useCallback((durationMs: number) => {
    setActiveDurationMs(durationMs);
  }, []);

  const handleMediaProgress = useCallback(
    (mediaProgressMs: number) => {
      if (!isActiveMedia) return;
      setProgressMs(mediaProgressMs);
    },
    [isActiveMedia]
  );

  useEffect(() => {
    if (areFontsLoaded) return;

    loadFont({
      google: {
        families: ['Norican', 'Oswald'],
      },
    });

    setAreFontsLoaded(true);
  }, [areFontsLoaded]);

  useEffect(() => {
    if (!isViewerOpen || isPaused || viewerStatuses.length === 0 || isActiveMedia) return;

    const tick = (timestamp: number) => {
      if (lastTimestampRef.current === null) {
        lastTimestampRef.current = timestamp;
      }

      const delta = timestamp - lastTimestampRef.current;
      lastTimestampRef.current = timestamp;

      setProgressMs((prev) => Math.min(prev + delta, VIEW_TIMEOUT_MS));
      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = null;
      lastTimestampRef.current = null;
    };
  }, [isViewerOpen, isPaused, viewerStatuses.length, activeIndex, isActiveMedia]);

  useEffect(() => {
    if (!isViewerOpen || isPaused) return;
    if (progressMs < activeDurationMs) return;
    goNext();
  }, [progressMs, isViewerOpen, isPaused, goNext, activeDurationMs]);

  useEffect(() => {
    if (activeIndex >= viewerStatuses.length && viewerStatuses.length > 0) {
      setActiveIndex(0);
    }
  }, [activeIndex, viewerStatuses.length]);

  useEffect(() => {
    if (!isViewerOpen) return;
    if (viewerStatuses.length === 0) {
      closeViewer();
    }
  }, [viewerStatuses.length, isViewerOpen, closeViewer]);

  useEffect(() => {
    if (!isViewerOpen) return;
    setProgressMs(0);
    setActiveDurationMs(isActiveMedia ? Number.MAX_SAFE_INTEGER : VIEW_TIMEOUT_MS);
  }, [activeIndex, isViewerOpen, isActiveMedia]);

  useEffect(() => {
    if (!isViewerOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'ArrowLeft') {
        event.preventDefault();
        goPrev();
      }

      if (event.code === 'ArrowRight') {
        event.preventDefault();
        goNext();
      }

      if (event.code === 'Space') {
        event.preventDefault();
        togglePause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isViewerOpen, goPrev, goNext, togglePause]);

  return {
    activeDurationMs,
    activeIndex,
    closeViewer,
    goNext,
    goPrev,
    handleMediaDurationChange,
    handleMediaProgress,
    isPaused,
    isViewerOpen,
    openViewerForContact,
    progressMs,
    removeStatusOptimistically,
    restoreDeletedStatus,
    togglePause,
    viewerStatuses,
  };
};
