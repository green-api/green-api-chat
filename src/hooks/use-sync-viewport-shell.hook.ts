import { useEffect } from 'react';

// iOS Safari keeps a focused input above the keyboard by panning the visual
// viewport within the (unchanged) layout viewport — a compositor-level shift
// that moves everything, including `position: fixed` elements, regardless of
// `overflow: hidden` on html/body. `interactive-widget=resizes-content`
// (index.html) opts newer browsers out of that pan entirely, but older iOS
// Safari versions ignore it and still pan. This mirrors `visualViewport`'s
// height *and* offsetTop onto `.full-chat` (`position: fixed` in
// full-chat.scss) so the app shell keeps re-centering itself over whatever
// area is actually visible, on browsers where the pan still happens.
export const useSyncViewportShell = () => {
  useEffect(() => {
    const viewport = window.visualViewport;
    let rafId: number | null = null;

    // Coalesce the burst of resize/scroll events fired while the keyboard's
    // own open/close animation is in progress into one update per frame —
    // applying every intermediate value as it arrives (no rAF batching) reads
    // as a jump because each one lands as a hard, untransitioned snap.
    const sync = () => {
      if (rafId !== null) {
        return;
      }

      rafId = requestAnimationFrame(() => {
        rafId = null;

        const height = viewport?.height ?? window.innerHeight;
        const top = viewport?.offsetTop ?? 0;

        document.documentElement.style.setProperty('--app-height', `${height}px`);
        document.documentElement.style.setProperty('--app-top', `${top}px`);
      });
    };

    sync();

    viewport?.addEventListener('resize', sync);
    viewport?.addEventListener('scroll', sync);
    window.addEventListener('resize', sync);

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }

      viewport?.removeEventListener('resize', sync);
      viewport?.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
    };
  }, []);
};
