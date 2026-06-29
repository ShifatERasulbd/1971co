import { useEffect, useRef, useState } from 'react';
import ProductZoomModal from './ProductZoomModal'; 

export default function SingleProductMediaGallery({
    images,
    primaryVideo,
    selectedImage,
    onSelectImage,
}) {
    const safeImages = Array.isArray(images) && images.length > 0 ? images : [];
    const activeImage = selectedImage || safeImages[0];
    const videoPlaceholderImage = safeImages[0] || activeImage || '';
    const [isVideoReady, setIsVideoReady] = useState(false);
    const videoRef = useRef(null);

    // Modal Control State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalImage, setModalImage] = useState('');

    useEffect(() => {
        setIsVideoReady(false);
    }, [primaryVideo]);

    if (!primaryVideo && !activeImage) return null;

    const handleImageClick = (image) => {
        onSelectImage(image);
        setModalImage(image);  
        setIsModalOpen(true);  
    };

    const handleVideoCanPlay = () => {
        setIsVideoReady(true);

        if (!videoRef.current) {
            return;
        }

        const playPromise = videoRef.current.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(() => {
                // Ignore autoplay interruptions (browser policy/network timing).
            });
        }
    };

    return (
        <div className="w-full">
            {/* Main grid wrapper handling the columns */}
            <div className="grid grid-cols-2 gap-3">
                {/* Primary Video Panel */}
                {primaryVideo ? (
                    <div className="relative overflow-hidden border border-zinc-900">
                        {!isVideoReady && videoPlaceholderImage ? (
                            <img
                                src={videoPlaceholderImage}
                                alt="Product preview"
                                className="aspect-[4/5] w-full object-cover object-center"
                            />
                        ) : null}
                        <video
                            ref={videoRef}
                            src={primaryVideo}
                            autoPlay
                            loop
                            muted
                            playsInline
                            controls
                            onCanPlay={handleVideoCanPlay}
                            className={`aspect-[4/5] w-full object-cover object-center ${
                                isVideoReady ? 'opacity-100' : 'absolute inset-0 opacity-0'
                            }`}
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

            {/* Modal Lightbox Viewport Component */}
            <ProductZoomModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                imageSrc={modalImage}
            />
        </div>
    );
}