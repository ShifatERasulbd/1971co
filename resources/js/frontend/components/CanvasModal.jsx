import React from 'react';
import { X } from 'lucide-react';

export default function CanvasModal({ isOpen, onClose, items }) {
    if (!isOpen) return null;

    return (
        // Main container with high z-index
        <div className="fixed inset-0 z-[9998] flex justify-center bg-zinc-950/95 overflow-y-auto animate-in fade-in duration-200">
            
            {/* Close Button with maximum z-index */}
            <button
                onClick={onClose}
                type="button"
                className="fixed top-6 right-6 z-[9999] inline-flex items-center justify-center rounded-full bg-white/10 p-3 text-white hover:bg-white/20 transition-all border border-white/10 shadow-2xl focus:outline-none"
                aria-label="Close modal"
            >
                <X size={28} strokeWidth={2} />
            </button>

            {/* Gallery Area */}
            <div className="w-full max-w-[1600px] pt-[118px] px-4 pb-12">
                <div className="columns-2 gap-4 sm:columns-3 md:columns-4 lg:columns-5 space-y-4">
                    {items.map((item, index) => (
                        <div 
                            key={item.id || index}
                            className="break-inside-avoid bg-white p-2 shadow-md rounded-sm"
                        >
                            <img
                                src={item.src}
                                alt={item.alt || 'Gallery full view'}
                                className="w-full h-auto object-contain"
                                loading="lazy"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}