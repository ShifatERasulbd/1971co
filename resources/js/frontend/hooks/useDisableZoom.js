import { useEffect } from 'react';

export default function useDisableZoom() {
  useEffect(() => {
    const root = document.documentElement;

    const blockCtrlWheel = (event) => {
      if (event.ctrlKey) {
        event.preventDefault();
      }
    };
    const blockGesture = (event) => event.preventDefault();
    const blockKeyZoom = (event) => {
      if ((event.ctrlKey || event.metaKey) && ['+', '=', '-', '_', '0'].includes(event.key)) {
        event.preventDefault();
      }
    };

    document.addEventListener('wheel', blockCtrlWheel, { passive: false });
    document.addEventListener('keydown', blockKeyZoom);
    document.addEventListener('gesturestart', blockGesture);
    document.addEventListener('gesturechange', blockGesture);
    root.style.touchAction = 'pan-x pan-y';

    return () => {
      document.removeEventListener('wheel', blockCtrlWheel);
      document.removeEventListener('keydown', blockKeyZoom);
      document.removeEventListener('gesturestart', blockGesture);
      document.removeEventListener('gesturechange', blockGesture);
      root.style.touchAction = '';
    };
  }, []);
}