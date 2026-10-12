import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const DOUBLE_TAP_SCALE = 2.5; // zoom level applied by a single click/tap
const SWIPE_DISTANCE = 50; // minimum px to count as a swipe
const TAP_TOLERANCE = 10; // max movement (px) that still counts as a tap

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

export default function ProductZoomModal({
    isOpen,
    onClose,
    imageSrc,
    images = [], // list of product images
    videoSrc = '', // product video url (optional)
    onChangeImage, // called with the new image/video when swiping
}) {
    const [view, setView] = useState({ scale: 1, x: 0, y: 0 });
    const [isInteracting, setIsInteracting] = useState(false);
    const [swipeX, setSwipeX] = useState(0); // image follows the finger while swiping
    const dialogRef = useRef(null);
    const imageBoxRef = useRef(null);
    const videoRef = useRef(null);
    const pointersRef = useRef(new Map());
    const gestureRef = useRef(null);
    const swipeRef = useRef(null); // swipe start point

    // video comes first, then the images
    const mediaList = videoSrc ? [videoSrc, ...images] : images;
    const isVideo = Boolean(videoSrc) && imageSrc === videoSrc;

    // go to next/previous item (loops around)
    const goToImage = (step) => {
        if (!Array.isArray(mediaList) || mediaList.length < 2 || typeof onChangeImage !== 'function') {
            return;
        }
        const currentIndex = Math.max(0, mediaList.indexOf(imageSrc));
        const nextIndex = (currentIndex + step + mediaList.length) % mediaList.length;
        onChangeImage(mediaList[nextIndex]);
    };

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        function handleKeyDown(event) {
            if (event.key === 'Escape') {
                onClose();
                return;
            }
            if (event.key === 'ArrowRight') {
                goToImage(1);
            } else if (event.key === 'ArrowLeft') {
                goToImage(-1);
            }
        }

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = previousOverflow;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, onClose, images, videoSrc, imageSrc, onChangeImage]);

    // Reset zoom when the modal opens or the image changes
    useEffect(() => {
        setView({ scale: 1, x: 0, y: 0 });
        setSwipeX(0);
        pointersRef.current.clear();
        gestureRef.current = null;
        swipeRef.current = null;
    }, [isOpen, imageSrc]);

    // Wheel / Ctrl+wheel / trackpad pinch zooms the image only
    useEffect(() => {
        const dialog = dialogRef.current;
        if (!isOpen || !dialog) {
            return undefined;
        }

        const handleWheel = (event) => {
            event.preventDefault();
            if (isVideo) return; // no zoom on video
            const box = imageBoxRef.current;
            if (!box) return;

            const rect = box.getBoundingClientRect();
            const delta = clamp(event.deltaY, -50, 50);
            const factor = Math.exp(-delta * (event.ctrlKey ? 0.02 : 0.004));

            setView((prev) => applyZoom(prev, prev.scale * factor, event.clientX, event.clientY, rect));
        };

        dialog.addEventListener('wheel', handleWheel, { passive: false });
        return () => dialog.removeEventListener('wheel', handleWheel);
    }, [isOpen, imageSrc, isVideo]);

    if (!isOpen || !imageSrc) {
        return null;
    }

    const handlePointerDown = (event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
        setIsInteracting(true);

        if (pointersRef.current.size === 1) {
            swipeRef.current = { x: event.clientX, y: event.clientY, multi: false };
        }

        if (pointersRef.current.size === 2) {
            if (swipeRef.current) {
                swipeRef.current.multi = true; // pinch is not a swipe
            }
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
            if (isVideo) return; // no pinch zoom on video

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

            if (view.scale > 1) {
                // Zoomed in: drag pans the image
                setView((prev) => clampView({ ...prev, x: prev.x + dx, y: prev.y + dy }, rect));
            } else if (swipeRef.current && !swipeRef.current.multi) {
                // not zoomed: image follows the finger horizontally
                setSwipeX(event.clientX - swipeRef.current.x);
            }
        }
    };

    // Pointer up decides tap (zoom / play-pause) vs swipe
    const handlePointerEnd = (event) => {
        pointersRef.current.delete(event.pointerId);
        gestureRef.current = null;

        if (pointersRef.current.size > 0) {
            return;
        }

        setIsInteracting(false);
        setSwipeX(0);

        const start = swipeRef.current;
        swipeRef.current = null;

        if (!start || start.multi || event.type !== 'pointerup') {
            return;
        }

        const dx = event.clientX - start.x;
        const dy = event.clientY - start.y;
        const isTap = Math.abs(dx) < TAP_TOLERANCE && Math.abs(dy) < TAP_TOLERANCE;

        // One click/tap = zoom toggle (images) or play/pause (video)
        if (isTap) {
            if (isVideo) {
                const video = videoRef.current;
                if (video) {
                    if (video.paused) {
                        const playPromise = video.play();
                        if (playPromise && typeof playPromise.catch === 'function') {
                            playPromise.catch(() => {});
                        }
                    } else {
                        video.pause();
                    }
                }
                return;
            }

            const rect = imageBoxRef.current.getBoundingClientRect();
            setView((prev) =>
                prev.scale > 1
                    ? { scale: 1, x: 0, y: 0 }
                    : applyZoom(prev, DOUBLE_TAP_SCALE, event.clientX, event.clientY, rect),
            );
            return;
        }

        // Swipe only works when not zoomed in
        if (view.scale > 1) {
            return;
        }

        if (Math.abs(dx) >= SWIPE_DISTANCE && Math.abs(dx) > Math.abs(dy) * 1.5) {
            // swipe right -> next, swipe left -> previous
            goToImage(dx > 0 ? 1 : -1);
        }
    };

    const isZoomed = view.scale > 1;
    const hasMultipleMedia = mediaList.length > 1; // only show arrows/slider when there is more than one item

    // SLIDER: position of the active item (drives the progress bar)
    const currentIndex = Math.max(0, mediaList.indexOf(imageSrc));

    // shared style so the video also follows the swipe
    const mediaStyle = {
        transform: `translate(${view.x + (isZoomed ? 0 : swipeX)}px, ${view.y}px) scale(${view.scale})`,
        transformOrigin: 'center center',
        transition: isInteracting ? 'none' : 'transform 0.15s ease-out',
        willChange: 'transform',
    };

    return (
        <div
            ref={dialogRef}
            className="fixed inset-0 z-[1600] flex items-center justify-center bg-black/90 p-4"
            role="dialog"
            aria-modal="true"
            aria-label={isVideo ? 'Product video' : 'Product image'}
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

            <div
                ref={imageBoxRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerEnd}
                onPointerCancel={handlePointerEnd}
                style={{ touchAction: 'none' }}
                className={`relative z-[1601] inline-flex select-none ${
                    isVideo
                        ? 'cursor-pointer'
                        : isZoomed
                          ? isInteracting
                              ? 'cursor-grabbing'
                              : 'cursor-grab'
                          : 'cursor-zoom-in'
                }`}
            >
                {isVideo ? (
                    <video
                        key={imageSrc}
                        ref={videoRef}
                        src={imageSrc}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="max-h-[92svh] max-w-[94vw] object-contain pointer-events-none"
                        style={mediaStyle}
                    />
                ) : (
                    <img
                        src={imageSrc}
                        alt="Product"
                        draggable={false}
                        className="max-h-[92svh] max-w-[94vw] object-contain pointer-events-none"
                        style={mediaStyle}
                    />
                )}

                {/* ← / → shown ON the image (desktop only) */}
                {hasMultipleMedia ? (
                    <>
                        <button
                            type="button"
                            onPointerDown={(event) => event.stopPropagation()}
                            onClick={() => goToImage(-1)}
                            aria-label="Previous"
                            className="absolute left-3 top-1/2 z-10 hidden size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/65 md:inline-flex"
                        >
                            <ArrowLeft className="size-6" />
                        </button>
                        <button
                            type="button"
                            onPointerDown={(event) => event.stopPropagation()}
                            onClick={() => goToImage(1)}
                            aria-label="Next"
                            className="absolute right-3 top-1/2 z-10 hidden size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/65 md:inline-flex"
                        >
                            <ArrowRight className="size-6" />
                        </button>
                    </>
                ) : null}
            </div>

            {/* SLIDER: mobile progress bar (hidden on md and up), shown only with multiple items */}
            {hasMultipleMedia ? (
                <div
                    className="pointer-events-none absolute inset-x-4 z-[1602] md:hidden"
                    style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 20px)' }}
                    role="progressbar"
                    aria-label="Media position"
                    aria-valuemin={1}
                    aria-valuemax={mediaList.length}
                    aria-valuenow={currentIndex + 1}
                >
                    <div className="relative h-[3px] w-full overflow-hidden rounded-full bg-white/25">
                        <div
                            className="absolute inset-y-0 rounded-full bg-white transition-all duration-300 ease-out"
                            style={{
                                width: `${100 / mediaList.length}%`,
                                left: `${(currentIndex * 100) / mediaList.length}%`,
                            }}
                        />
                    </div>
                </div>
            ) : null}
        </div>
    );
}