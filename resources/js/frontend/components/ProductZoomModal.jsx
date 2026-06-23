import { useState } from 'react';

export default function ProductZoomModal({ isOpen, onClose, imageSrc }) {
    const [zoomStyle, setZoomStyle] = useState({ display: 'none' });

    if (!isOpen || !imageSrc) return null;

    const handleMouseMove = (e) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        
        // Exact cursor positioning relative to the modal image container
        const x = e.clientX - left;
        const y = e.clientY - top;

        const xPercent = Math.max(0, Math.min(100, (x / width) * 100));
        const yPercent = Math.max(0, Math.min(100, (y / height) * 100));

        setZoomStyle({
            display: 'block',
            backgroundImage: `url(${imageSrc})`,
            backgroundPosition: `${xPercent}% ${yPercent}%`,
            backgroundSize: '200%', // Zoom factor inside the modal
            backgroundRepeat: 'no-repeat',
        });
    };

    const handleMouseLeave = () => {
        setZoomStyle({ display: 'none' });
    };

    return (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in"
            onClick={onClose} // Closes modal when clicking the dark backdrop area
        >
            <div 
                className="relative max-w-4xl w-full bg-white p-2 rounded-md shadow-2xl"
                onClick={(e) => e.stopPropagation()} // Prevents closing when clicking inside the panel
            >
                {/* Close Button */}
                <button 
                    type="button"
                    onClick={onClose}
                    className="absolute -top-10 right-0 text-white hover:text-zinc-300 text-sm font-medium tracking-wide transition-colors bg-zinc-900/40 px-3 py-1 rounded-full"
                >
                    ✕ Close
                </button>

                {/* Interactive Zoom Window */}
                <div 
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    className="relative w-full overflow-hidden border border-zinc-200 cursor-zoom-in rounded-sm select-none"
                >
                    <img 
                        src={imageSrc} 
                        alt="Zoomed Product View" 
                        className="w-full max-h-[75vh] object-contain pointer-events-none"
                    />

                    {/* Magnifier glass lens tracking your pointer internally */}
                    {zoomStyle.display !== 'none' && (
                        <div 
                            style={zoomStyle}
                            className="absolute inset-0 pointer-events-none bg-white"
                        />
                    )}
                </div>
            </div>
        </div>
    );
}