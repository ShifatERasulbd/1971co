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
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        
        // 1. Precise cursor location relative to the currently hovered box
        const x = e.clientX - left;
        const y = e.clientY - top;

        // 2. Normalize to a 0-1 ratio decimal
        const xRatio = Math.max(0, Math.min(1, x / width));
        const yRatio = Math.max(0, Math.min(1, y / height));

        // 3. Zoom focal point offset correction math
        const zoomFactor = 2.5; // Matches 250% size
        const xOffset = (xRatio * zoomFactor - xRatio) * (100 / (zoomFactor - 1));
        const yOffset = (yRatio * zoomFactor - yRatio) * (100 / (zoomFactor - 1));

        setHoveredIndex(index);
        setZoomStyle({
            display: 'block',
            backgroundImage: `url(${hoveredImage})`,
            backgroundPosition: `${xOffset}% ${yOffset}%`,
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

    return (
        <div className="w-full">
            {/* Main grid wrapper handling the columns */}
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
                    
                    /* CRITICAL FIX: Calculate the ACTUAL visual column placement.
                       If a video exists, it occupies slot 0, pushing index 0 to grid slot 1.
                    */
                    const visualGridIndex = primaryVideo ? index + 1 : index;
                    const isRightColumn = visualGridIndex % 2 !== 0;

                    /* THE ROW ALIGNMENT FIX:
                       If the item is visually on the right column, show zoom on its left.
                       If the item is visually on the left column, show zoom on its right.
                    */
                    const alignmentClass = isRightColumn 
                        ? 'right-[calc(100%+12px)]' 
                        : 'left-[calc(100%+12px)]';

                    return (
                        <div key={`${image}-${index}`} className="relative">
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

                            {/* LOCALIZED ZOOM PORTAL */}
                            {zoomStyle.display !== 'none' && hoveredIndex === index && (
                                <div
                                    style={zoomStyle}
                                    className={`absolute top-0 z-50 hidden md:block w-full h-full border border-zinc-200 bg-white shadow-xl rounded-sm pointer-events-none ${alignmentClass}`}
                                />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Modal Lightbox Viewport Component */}
            <ProductZoomModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                imageSrc={modalImage}
            />
        </div>
    );
}