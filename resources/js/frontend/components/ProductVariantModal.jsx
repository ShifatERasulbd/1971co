import { Minus, Plus, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const fallbackImage = '/uploads/heroes/images/hero1.webp';

function toAbsoluteImageUrl(path) {
    if (!path || typeof path !== 'string') {
        return fallbackImage;
    }

    if (path.startsWith('http')) {
        return path;
    }

    return `/${path.replace(/^\/+/, '')}`;
}

function parseList(value) {
    if (Array.isArray(value)) {
        return value.map((item) => String(item || '').trim()).filter(Boolean);
    }

    if (typeof value === 'string' && value.trim()) {
        return value
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
    }

    return [];
}

function getProductColors(product) {
    const direct = parseList(product?.color);
    if (direct.length > 0) {
        return [...new Set(direct)];
    }

    if (product?.color_variant_images && typeof product.color_variant_images === 'object') {
        return Object.keys(product.color_variant_images).map((item) => String(item || '').trim()).filter(Boolean);
    }

    return [];
}

function getProductSizes(product) {
    const direct = parseList(product?.sizes);
    if (direct.length > 0) {
        return [...new Set(direct)];
    }

    const variantsList = parseList(product?.size_variants);
    if (variantsList.length > 0) {
        return [...new Set(variantsList)];
    }

    const single = parseList(product?.size);
    if (single.length > 0) {
        return [...new Set(single)];
    }

    const singleVariant = parseList(product?.size_variant?.size);
    if (singleVariant.length > 0) {
        return [...new Set(singleVariant)];
    }

    const variants = Array.isArray(product?.variant_rows) ? product.variant_rows : [];
    const extracted = variants
        .map((item) => String(item?.size || '').trim())
        .filter(Boolean);

    return [...new Set(extracted)];
}

function getSwatchColor(value, colorLookup = {}) {
    if (typeof value !== 'string') {
        return '#d4d4d8';
    }

    const trimmed = value.trim();
    if (/^#[0-9a-f]{6}$/i.test(trimmed)) {
        return trimmed;
    }

    const mapped = colorLookup[trimmed.toLowerCase()];
    if (mapped && /^#[0-9a-f]{6}$/i.test(mapped)) {
        return mapped;
    }

    if (/^[a-z]+$/i.test(trimmed)) {
        return trimmed.toLowerCase();
    }

    return '#d4d4d8';
}

function normalizeImageKey(path) {
    if (!path || typeof path !== 'string') {
        return '';
    }

    return path.replace(/^https?:\/\/[^/]+/i, '').replace(/^\/+/, '').trim();
}

function collectGalleryImages(product, selectedColor) {
    const gallery = Array.isArray(product?.image_gallery) ? product.image_gallery : [];
    const colorVariantMap =
        product?.color_variant_images && typeof product.color_variant_images === 'object'
            ? product.color_variant_images
            : {};

    const colorImages = selectedColor && Array.isArray(colorVariantMap[selectedColor])
        ? colorVariantMap[selectedColor]
        : [];

    const candidates = [
        ...colorImages,
        product?.cover_image,
        ...gallery,
    ].filter(Boolean);

    const seen = new Set();
    const deduped = [];

    candidates.forEach((item) => {
        const key = normalizeImageKey(item);
        if (!key || seen.has(key)) {
            return;
        }

        seen.add(key);
        deduped.push(toAbsoluteImageUrl(item));
    });

    return deduped.length > 0 ? deduped : [fallbackImage];
}

function toPrice(value) {
    const next = Number(value);
    return Number.isFinite(next) ? next : 0;
}

export default function ProductVariantModal({
    isOpen,
    product,
    colorLookup = {},
    defaults = {},
    onClose,
    onConfirm,
}) {
    const colors = useMemo(() => getProductColors(product), [product]);
    const sizes = useMemo(() => getProductSizes(product), [product]);

    const [selectedColor, setSelectedColor] = useState('');
    const [selectedSize, setSelectedSize] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    const galleryImages = useMemo(
        () => collectGalleryImages(product, selectedColor),
        [product, selectedColor],
    );

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const initialColor = String(defaults?.selectedColor || '').trim();
        const nextColor = colors.includes(initialColor) ? initialColor : (colors[0] || '');
        const initialSize = String(defaults?.selectedSize || '').trim();
        const nextSize = sizes.includes(initialSize) ? initialSize : (sizes[0] || '');

        setSelectedColor(nextColor);
        setSelectedSize(nextSize);
        setQuantity(1);
        setActiveImageIndex(0);
    }, [isOpen, product, defaults, colors, sizes]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        function handleEscape(event) {
            if (event.key === 'Escape') {
                onClose?.();
            }
        }

        window.addEventListener('keydown', handleEscape);

        return () => {
            window.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = previousOverflow;
        };
    }, [isOpen, onClose]);

    if (!isOpen || !product) {
        return null;
    }

    const name = String(product?.name || 'Product').trim() || 'Product';
    const price = toPrice(product?.priceValue ?? product?.price);
    const mainImage = galleryImages[activeImageIndex] || fallbackImage;
    const needsColor = colors.length > 0;
    const needsSize = sizes.length > 0;
    const canSubmit = (!needsColor || selectedColor) && (!needsSize || selectedSize);

    return (
        <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-black/55 p-2 sm:p-4 lg:p-6" role="dialog" aria-modal="true" aria-label={`Select options for ${name}`}>
            <button
                type="button"
                aria-label="Close product options"
                onClick={onClose}
                className="absolute inset-0"
            />

            <div className="relative z-[1501] grid h-[min(96svh,900px)] w-full max-w-[980px] overflow-y-auto border border-zinc-200 bg-white shadow-2xl lg:grid-cols-[1fr_1.1fr] lg:overflow-hidden">
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close product options"
                    className="absolute right-2 top-2 z-20 inline-flex size-9 items-center justify-center rounded-full bg-white/95 text-zinc-700 shadow-sm transition-colors hover:text-zinc-900 lg:hidden"
                >
                    <X className="size-5" />
                </button>

                <div className="bg-zinc-100">
                    <img
                        src={mainImage}
                        alt={name}
                        className="h-[240px] w-full object-cover object-top sm:h-[300px] lg:h-[620px]"
                    />

                    {galleryImages.length > 1 ? (
                        <div className="grid grid-cols-4 gap-1 border-t border-zinc-200 bg-white p-2">
                            {galleryImages.slice(0, 8).map((image, index) => (
                                <button
                                    key={`${image}-${index}`}
                                    type="button"
                                    onClick={() => setActiveImageIndex(index)}
                                    className={`overflow-hidden border ${activeImageIndex === index ? 'border-zinc-900' : 'border-zinc-200'}`}
                                >
                                    <img src={image} alt={`${name} ${index + 1}`} className="h-16 w-full object-cover" />
                                </button>
                            ))}
                        </div>
                    ) : null}
                </div>

                <div className="flex flex-col p-4 sm:p-6 lg:p-8">
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close product options"
                        className="absolute right-3 top-3 hidden size-8 items-center justify-center text-zinc-500 transition-colors hover:text-zinc-900 lg:inline-flex"
                    >
                        <X className="size-5" />
                    </button>

                    <h3 className="pr-8 text-[1.25rem] font-semibold leading-tight text-zinc-900 sm:text-[1.45rem] lg:text-[1.8rem]">{name}</h3>
                    <p className="mt-1 text-[1.2rem] text-zinc-700 sm:text-[1.3rem] lg:text-[1.45rem]">${price.toFixed(2)}</p>

                    <div className="mt-7 space-y-5">
                        <div>
                            <p className="mb-2 text-[0.86rem] uppercase tracking-[0.12em] text-zinc-600">Color</p>
                            {colors.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {colors.map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setSelectedColor(color)}
                                            className={`inline-flex items-center gap-2 border px-2.5 py-1.5 text-[0.78rem] uppercase tracking-[0.08em] ${
                                                selectedColor === color
                                                    ? 'border-zinc-900 bg-zinc-900 text-white'
                                                    : 'border-zinc-300 text-zinc-700 hover:border-zinc-700'
                                            }`}
                                        >
                                            <span
                                                className="inline-block size-3.5 rounded-full border border-black/15"
                                                style={{ backgroundColor: getSwatchColor(color, colorLookup) }}
                                            />
                                            {color}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-zinc-400">No color options</p>
                            )}
                        </div>

                        <div>
                            <p className="mb-2 text-[0.86rem] uppercase tracking-[0.12em] text-zinc-600">Size</p>
                            {sizes.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {sizes.map((size) => (
                                        <button
                                            key={size}
                                            type="button"
                                            onClick={() => setSelectedSize(size)}
                                            className={`min-w-12 border px-3 py-2 text-[0.82rem] uppercase tracking-[0.1em] ${
                                                selectedSize === size
                                                    ? 'border-zinc-900 bg-zinc-900 text-white'
                                                    : 'border-zinc-300 text-zinc-700 hover:border-zinc-700'
                                            }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-zinc-400">No size options</p>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 pt-2 lg:mt-auto lg:pt-8">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="inline-flex h-12 items-center border border-zinc-300">
                                <button
                                    type="button"
                                    aria-label="Decrease quantity"
                                    onClick={() => setQuantity((previous) => Math.max(1, previous - 1))}
                                    className="inline-flex h-full w-11 items-center justify-center text-zinc-700"
                                >
                                    <Minus className="size-4" />
                                </button>
                                <span className="inline-flex h-full min-w-10 items-center justify-center border-x border-zinc-300 px-2 text-sm text-zinc-900">
                                    {quantity}
                                </span>
                                <button
                                    type="button"
                                    aria-label="Increase quantity"
                                    onClick={() => setQuantity((previous) => previous + 1)}
                                    className="inline-flex h-full w-11 items-center justify-center text-zinc-700"
                                >
                                    <Plus className="size-4" />
                                </button>
                            </div>

                            <button
                                type="button"
                                disabled={!canSubmit}
                                onClick={() => {
                                    onConfirm?.({
                                        selectedColor,
                                        selectedSize,
                                        quantity,
                                        image: mainImage,
                                    });
                                }}
                                className="inline-flex h-12 w-full flex-1 items-center justify-center bg-zinc-900 px-6 text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:bg-zinc-400 sm:text-[0.8rem] sm:tracking-[0.14em]"
                            >
                                Add to cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
