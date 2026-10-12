import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

// UPDATED: zoom helpers
const MIN_SCALE = 1;
const MAX_SCALE = 4;
const DOUBLE_TAP_SCALE = 2.5;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function clampView(view, rect) {
    if (view.scale <= 1) {
        return { scale: 1, x: 0, y: 0 };
    }
    const maxX = ((view.scale - 1) * rect.width) / 2;
    const maxY = ((view.scale - 1) * rect.height) / 2;
    return {
        scale: view.scale,
        x: clamp(view.x, -maxX, maxX),
        y: clamp(view.y, -maxY, maxY),
    };
}

// Zoom while keeping the point under the cursor/fingers fixed
function applyZoom(prev, rawScale, clientX, clientY, rect) {
    const nextScale = clamp(rawScale, MIN_SCALE, MAX_SCALE);
    const px = clientX - (rect.left + rect.width / 2);
    const py = clientY - (rect.top + rect.height / 2);
    const ratio = nextScale / prev.scale;

    return clampView(
        {
            scale: nextScale,
            x: px - ratio * (px - prev.x),
            y: py - ratio * (py - prev.y),
        },
        rect,
    );
}

export default function ProductZoomModal({ isOpen, onClose, imageSrc }) {
    // UPDATED: zoom state and refs
    const [view, setView] = useState({ scale: 1, x: 0, y: 0 });
    const [isInteracting, setIsInteracting] = useState(false);
    const dialogRef = useRef(null);
    const imageBoxRef = useRef(null);
    const pointersRef = useRef(new Map());
    const gestureRef = useRef(null);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        function handleEscape(event) {
            if (event.key === 'Escape') {
                onClose();
            }
        }

        window.addEventListener('keydown', handleEscape);

        return () => {
            window.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = previousOverflow;
        };
    }, [isOpen, onClose]);

    // UPDATED: reset zoom when the modal opens or the image changes
    useEffect(() => {
        setView({ scale: 1, x: 0, y: 0 });
        pointersRef.current.clear();
        gestureRef.current = null;
    }, [isOpen, imageSrc]);

    // UPDATED: wheel / Ctrl+wheel / trackpad pinch zooms the image only
    useEffect(() => {
        const dialog = dialogRef.current;
        if (!isOpen || !dialog) {
            return undefined;
        }

        const handleWheel = (event) => {
            event.preventDefault();
            const box = imageBoxRef.current;
            if (!box) return;

            const rect = box.getBoundingClientRect();
            const delta = clamp(event.deltaY, -50, 50);
            const factor = Math.exp(-delta * (event.ctrlKey ? 0.02 : 0.004));

            setView((prev) => applyZoom(prev, prev.scale * factor, event.clientX, event.clientY, rect));
        };

        dialog.addEventListener('wheel', handleWheel, { passive: false });
        return () => dialog.removeEventListener('wheel', handleWheel);
    }, [isOpen, imageSrc]);

    if (!isOpen || !imageSrc) {
        return null;
    }

    // UPDATED: pointer handlers (drag to pan, two-finger pinch)
    const handlePointerDown = (event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
        setIsInteracting(true);

        if (pointersRef.current.size === 2) {
            const [a, b] = [...pointersRef.current.values()];
            gestureRef.current = {
                dist: Math.hypot(a.x - b.x, a.y - b.y),
                mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
            };
        }
    };

    const handlePointerMove = (event) => {
        const pointers = pointersRef.current;
        const previous = pointers.get(event.pointerId);
        if (!previous) return;

        pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
        const rect = imageBoxRef.current.getBoundingClientRect();

        if (pointers.size === 2) {
            const [a, b] = [...pointers.values()];
            const dist = Math.hypot(a.x - b.x, a.y - b.y);
            const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
            const last = gestureRef.current;

            if (last && last.dist > 0) {
                setView((prev) => {
                    const zoomed = applyZoom(prev, (prev.scale * dist) / last.dist, mid.x, mid.y, rect);
                    return clampView(
                        { ...zoomed, x: zoomed.x + (mid.x - last.mid.x), y: zoomed.y + (mid.y - last.mid.y) },
                        rect,
                    );
                });
            }
            gestureRef.current = { dist, mid };
            return;
        }

        if (pointers.size === 1) {
            const dx = event.clientX - previous.x;
            const dy = event.clientY - previous.y;
            setView((prev) =>
                prev.scale > 1 ? clampView({ ...prev, x: prev.x + dx, y: prev.y + dy }, rect) : prev,
            );
        }
    };

    const handlePointerEnd = (event) => {
        pointersRef.current.delete(event.pointerId);
        gestureRef.current = null;
        if (pointersRef.current.size === 0) {
            setIsInteracting(false);
        }
    };

    const handleDoubleClick = (event) => {
        const rect = imageBoxRef.current.getBoundingClientRect();
        setView((prev) =>
            prev.scale > 1
                ? { scale: 1, x: 0, y: 0 }
                : applyZoom(prev, DOUBLE_TAP_SCALE, event.clientX, event.clientY, rect),
        );
    };

    const isZoomed = view.scale > 1;

    return (
        <div
            ref={dialogRef} // UPDATED
            className="fixed inset-0 z-[1600] flex items-center justify-center bg-black/90 p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Product image"
        >
            <button
                type="button"
                onClick={onClose}
                aria-label="Close product image"
                className="absolute inset-0 cursor-zoom-out"
            />
            <button
                type="button"
                onClick={onClose}
                aria-label="Close product image"
                className="absolute right-4 top-4 z-[1602] inline-flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
                <X className="size-6" />
            </button>

            {/* UPDATED: wrapper receives the zoom gestures; the image scales inside it */}
            <div
                ref={imageBoxRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerEnd}
                onPointerCancel={handlePointerEnd}
                onDoubleClick={handleDoubleClick}
                style={{ touchAction: 'none' }}
                className={`relative z-[1601] inline-flex select-none ${
                    isZoomed ? (isInteracting ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in'
                }`}
            >
                <img
                    src={imageSrc}
                    alt="Product"
                    draggable={false}
                    className="max-h-[92svh] max-w-[94vw] object-contain pointer-events-none"
                    style={{
                        transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
                        transformOrigin: 'center center',
                        transition: isInteracting ? 'none' : 'transform 0.15s ease-out',
                        willChange: 'transform',
                    }}
                />
            </div>
        </div>
    );
}