import { useState } from 'react';
import ProductZoomModal from './ProductZoomModal'; // Import your new modal component

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

    // Triggered when a product thumbnail is clicked
    const handleImageClick = (image) => {
        onSelectImage(image); // Maintains your original active state handler
        setModalImage(image);  // Assign target asset to modal
        setIsModalOpen(true);  // Pop up the viewport overlay
    };

    return (
        <div className="w-full">
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
                    const isRightColumn = index % 2 !== 0;
                    const sidePositionClass = isRightColumn ? 'right-[104%]' : 'left-[104%]';

                    return (
                        <div key={`${image}-${index}`} className="relative">
                            <button
                                type="button"
                                onClick={() => handleImageClick(image)} // Dynamic click router
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

                            {/* Hovering side-by-side zoom window panel */}
                            {zoomStyle.display !== 'none' && hoveredIndex === index && (
                                <div
                                    style={zoomStyle}
                                    className={`absolute top-0 z-50 hidden md:block w-full h-full border border-zinc-200 bg-white shadow-xl rounded-sm pointer-events-none ${sidePositionClass}`}
                                />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Connect and Mount Modal Viewport Component */}
            <ProductZoomModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                imageSrc={modalImage}
            />
        </div>
    );
}