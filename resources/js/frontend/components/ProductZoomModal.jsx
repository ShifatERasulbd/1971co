import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function ProductZoomModal({ isOpen, onClose, imageSrc }) {
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

    if (!isOpen || !imageSrc) {
        return null;
    }

    return (
        <div
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
                className="absolute right-4 top-4 z-[1601] inline-flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
                <X className="size-6" />
            </button>
            <img
                src={imageSrc}
                alt="Product"
                className="relative z-[1601] max-h-[92svh] max-w-[94vw] object-contain"
            />
        </div>
    );
}
