import { useState } from 'react';
import ProductZoomModal from './ProductZoomModal'; 

export default function SingleProductMediaGallery({
    images,
    primaryVideo,
    selectedImage,
    onSelectImage,
}) {
    const safeImages = Array.isArray(images) && images.length > 0 ? images : [];
    const activeImage = selectedImage || safeImages[0];

    // Gallery Hover Magnifier State
    const [zoomStyle, setZoomStyle] = useState({ display: 'none' });
    const [hoveredIndex, setHoveredIndex] = useState(null);

    // Modal Control State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalImage, setModalImage] = useState('');

    if (!primaryVideo && !activeImage) return null;

    const handleMouseMove = (e, hoveredImage, index) => {
        // Target the button itself to isolate correct hover percentages
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - left;
        const y = e.clientY - top;

        const xPercent = Math.max(0, Math.min(100, (x / width) * 100));
        const yPercent = Math.max(0, Math.min(100, (y / height) * 100));

        setHoveredIndex(index);
        setZoomStyle({
            display: 'block',
            backgroundImage: `url(${hoveredImage})`,
            backgroundPosition: `${xPercent}% ${yPercent}%`,
            backgroundSize: '250%',
            backgroundRepeat: 'no-repeat',
        });
    };

    const handleMouseLeave = () => {
        setZoomStyle({ display: 'none' });
        setHoveredIndex(null);
    };

    const handleImageClick = (image) => {
        onSelectImage(image);
        setModalImage(image);  
        setIsModalOpen(true);  
    };

    // Determine position variables based on what index is currently hovered
    const isRightColumnHovered = hoveredIndex !== null && hoveredIndex % 2 !== 0;

    return (
        /* CRITICAL FIX: The outer container is 'relative' so the zoom layout window 
           can accurately overlay across the whole grid layout map.
        */
        <div className="relative w-full">
            <div className="grid grid-cols-2 gap-3">
                {/* Primary Video Panel */}
                {primaryVideo ? (
                    <div className="overflow-hidden border border-zinc-900">
                        <video
                            src={primaryVideo}
                            autoPlay
                            loop
                            muted
                            playsInline
                            controls
                            className="aspect-[4/5] w-full object-cover object-center"
                            preload="metadata"
                        />
                    </div>
                ) : null}

                {/* Product Images Loop */}
                {safeImages.slice(0, 6).map((image, index) => {
                    const isCurrentlyActive = activeImage === image;

                    return (
                        <div key={`${image}-${index}`}>
                            <button
                                type="button"
                                onClick={() => handleImageClick(image)}
                                onMouseMove={(e) => handleMouseMove(e, image, index)}
                                onMouseLeave={handleMouseLeave}
                                className={`w-full overflow-hidden border transition-all duration-200 cursor-zoom-in ${
                                    isCurrentlyActive
                                        ? 'border-zinc-900'
                                        : 'border-zinc-200 hover:border-zinc-400'
                                }`}
                            >
                                <img
                                    src={image}
                                    alt={`Product ${index + 1}`}
                                    className="aspect-[4/5] w-full object-cover object-center pointer-events-none"
                                />
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* FIXED OVERLAY ZOOM WINDOW:
                - Removed from individual loops and positioned globally relative to the grid wrapper.
                - Calculates width using `w-[calc(50%-6px)]` so it matches a single column exactly.
                - If browsing the right image, it snaps to the left margin (`left-0`).
                - If browsing the left image, it snaps to the right margin (`right-0`).
            */}
            {zoomStyle.display !== 'none' && hoveredIndex !== null && (
                <div
                    style={zoomStyle}
                    className={`absolute top-0 z-50 hidden md:block w-[calc(50%-6px)] h-full border border-zinc-900 bg-white shadow-xl rounded-sm pointer-events-none ${
                        isRightColumnHovered ? 'left-0' : 'right-0'
                    }`}
                />
            )}

            {/* Connect and Mount Modal Viewport Component */}
            <ProductZoomModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                imageSrc={modalImage}
            />
        </div>
    );
}