import { useEffect } from 'react';

const isZoomAllowed = () => document.documentElement.hasAttribute('data-zoom-allowed');

export default function useDisableZoom() {
  useEffect(() => {
    const root = document.documentElement;

    const blockCtrlWheel = (event) => {
      if (event.ctrlKey && !isZoomAllowed()) {
        event.preventDefault();
      }
    };
    const blockGesture = (event) => {
      if (!isZoomAllowed()) {
        event.preventDefault();
      }
    };
    const blockKeyZoom = (event) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        ['+', '=', '-', '_', '0'].includes(event.key) &&
        !isZoomAllowed()
      ) {
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

// Call with true while a popup/lightbox is open to allow zoom inside it.
export function useAllowZoom(isActive) {
  useEffect(() => {
    if (!isActive) {
      return undefined;
    }

    const root = document.documentElement;
    const previousTouchAction = root.style.touchAction;

    root.setAttribute('data-zoom-allowed', '');
    root.style.touchAction = ''; // touch-action can't be re-enabled by a child, so lift it here

    return () => {
      root.removeAttribute('data-zoom-allowed');
      root.style.touchAction = previousTouchAction;
    };
  }, [isActive]);
}