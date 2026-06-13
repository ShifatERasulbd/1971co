import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

import {
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
    getDesignGuideArea,
} from '../config';

/**
 * Calculates absolute pixel dimensions for the design overlay based on canvas layout size.
 * Uses updated coordinate scales to position the print box accurately over the chest area.
 */
function getAbsoluteDesignArea(activeArea, canvasWidth, canvasHeight) {
    if (!activeArea) return null;
    
    return {
        left: activeArea.left * canvasWidth,
        top: activeArea.top * canvasHeight,
        width: activeArea.width * canvasWidth,
        height: activeArea.height * canvasHeight,
    };
}

function syncFabricCanvasContainer(canvasElement) {
    if (!canvasElement) return;

    const container = canvasElement.closest('.canvas-container');
    if (!container) return;

    container.style.width = '100%';
    container.style.maxWidth = '100%';
    container.style.height = 'auto';
    container.style.aspectRatio = `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}`;

    const lowerCanvas = container.querySelector('canvas.lower-canvas') || canvasElement;
    const upperCanvas = container.querySelector('canvas.upper-canvas');

    [lowerCanvas, upperCanvas].forEach((canvasNode) => {
        if (!canvasNode) return;
        canvasNode.style.width = '100%';
        canvasNode.style.height = '100%';
        canvasNode.style.maxWidth = '100%';
        canvasNode.style.display = 'block';
    });
}

export default function CanvasStage({
    canvasRef,
    productViews,
    activeView,
    onSwitchView,
    onDropDesign,
}) {
    const [isDragOver, setIsDragOver] = useState(false);

    const wrapperRef = useRef(null);
    const [canvasSize, setCanvasSize] = useState({
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
    });

    const activeDesignArea = getDesignGuideArea(activeView, canvasSize.width);
    
    // Compute the absolute pixel bounds dynamically using the translation helper
    const absoluteBounds = getAbsoluteDesignArea(
        activeDesignArea, 
        canvasSize.width, 
        canvasSize.height
    );

    // Track real rendered canvas size
    useEffect(() => {
        const updateCanvasSize = () => {
            if (!wrapperRef.current) return;

            syncFabricCanvasContainer(canvasRef.current);

            const rect = wrapperRef.current.getBoundingClientRect();

            setCanvasSize({
                width: rect.width,
                height: rect.width * (CANVAS_HEIGHT / CANVAS_WIDTH),
            });
        };

        updateCanvasSize();

        let resizeObserver;
        if (typeof ResizeObserver !== 'undefined' && wrapperRef.current) {
            resizeObserver = new ResizeObserver(updateCanvasSize);
            resizeObserver.observe(wrapperRef.current);
        }

        let mutationObserver;
        if (typeof MutationObserver !== 'undefined' && wrapperRef.current) {
            mutationObserver = new MutationObserver(updateCanvasSize);
            mutationObserver.observe(wrapperRef.current, {
                childList: true,
                subtree: true,
            });
        }

        window.addEventListener('resize', updateCanvasSize);

        return () => {
            window.removeEventListener('resize', updateCanvasSize);
            resizeObserver?.disconnect();
            mutationObserver?.disconnect();
        };
    }, [canvasRef]);

    const handleDragOver = (event) => {
        event.preventDefault();

        if (!event.dataTransfer?.types?.includes('application/x-personalizer-design')) {
            return;
        }

        event.dataTransfer.dropEffect = 'copy';

        if (!isDragOver) {
            setIsDragOver(true);
        }
    };

    const handleDragLeave = () => {
        if (isDragOver) {
            setIsDragOver(false);
        }
    };

    const handleDrop = (event) => {
        event.preventDefault();

        setIsDragOver(false);

        const payload = event.dataTransfer?.getData(
            'application/x-personalizer-design'
        );

        if (!payload || !onDropDesign) return;

        try {
            const parsed = JSON.parse(payload);

            onDropDesign(parsed, {
                clientX: event.clientX,
                clientY: event.clientY,
            });
        } catch {
            // Ignore malformed payload
        }
    };

    return (
        <section className="overflow-hidden rounded-[32px] border border-zinc-200 bg-white shadow-sm">
            <div className="flex flex-col">
                <div className="flex-1 bg-[radial-gradient(circle_at_top,#ffffff,transparent_45%),linear-gradient(180deg,#f7f6f2_0%,#f2f0ea_100%)] p-4 sm:p-6">
                    <div
                        className={cn(
                            'mx-auto flex max-w-[860px] items-center justify-center rounded-[30px] border bg-white shadow-inner transition-colors',
                            isDragOver
                                ? 'border-zinc-950/70 ring-2 ring-zinc-950/20'
                                : 'border-zinc-200/60'
                        )}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        {/* Parent wrapper clips content and matches canvas container scaling */}
                        <div
                            ref={wrapperRef}
                            className="relative w-full overflow-hidden rounded-[28px]"
                        >
                            {/* CANVAS */}
                            <canvas
                                ref={canvasRef}
                                className="block h-auto w-full max-w-full"
                                style={{
                                    aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}`,
                                }}
                            />

                            {/* DESIGN AREA BORDER */}
                            {absoluteBounds && (
                                <div
                                    className="pointer-events-none absolute border-2 border-dashed border-red-500 rounded-md"
                                    style={{
                                        left: absoluteBounds.left,
                                        top: absoluteBounds.top,
                                        width: absoluteBounds.width,
                                        height: absoluteBounds.height,
                                    }}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* VIEW SWITCHER */}
                <div className="border-t border-zinc-200 bg-white px-4 py-4 sm:px-6">
                    <div className="flex flex-wrap gap-3">
                        {productViews.map((view) => (
                            <button
                                key={view.id}
                                type="button"
                                onClick={() => onSwitchView(view)}
                                className={cn(
                                    'rounded-2xl border p-2 transition-colors',
                                    activeView === view.id
                                        ? 'border-zinc-950 shadow-sm'
                                        : 'border-zinc-200 hover:border-zinc-400'
                                )}
                            >
                                <img
                                    src={view.url}
                                    alt={view.label}
                                    className="h-20 w-16 rounded-xl object-cover"
                                />
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}