import { useEffect, useMemo, useState } from 'react';

import { resolveProductFeatureIcon } from '../../shared/productFeatureIcons';

function RulerIcon() {
    return (
        <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
            <path
                d="M6 18 18 6m-8 0 1.5 1.5M8 8l1.5 1.5m1.5-4.5L13 6.5m1.5-4.5L16 3.5M4.5 19.5l-1-1a1.4 1.4 0 0 1 0-2l11-11a1.4 1.4 0 0 1 2 0l1 1a1.4 1.4 0 0 1 0 2l-11 11a1.4 1.4 0 0 1-2 0Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function resolveSwatchColor(value, colorLookup = {}) {
    const raw = String(value || '').trim();
    if (/^#[0-9a-f]{3,8}$/i.test(raw)) {
        return raw;
    }

    const mappedColor = colorLookup[raw.toLowerCase()] || colorLookup[raw];
    if (mappedColor && /^#[0-9a-f]{6}$/i.test(String(mappedColor))) {
        return mappedColor;
    }

    if (/^[a-z]+$/i.test(raw)) {
        return raw.toLowerCase();
    }

    return '#d4d4d8';
}

function toOptionalImageUrl(path) {
    if (!path || typeof path !== 'string') {
        return '';
    }

    const trimmed = path.trim();
    if (!trimmed) {
        return '';
    }

    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/')) {
        return trimmed;
    }

    return `/${trimmed.replace(/^\/+/, '')}`;
}

function normalizeProductFeatures(value) {
    if (Array.isArray(value)) {
        return value
            .filter((item) => item && typeof item === 'object')
            .map((item) => ({
                icon: String(item.icon || 'sparkles').trim() || 'sparkles',
                text: String(item.text || '').trim(),
            }))
            .filter((item) => item.text !== '');
    }

    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) {
            return [];
        }

        try {
            const decoded = JSON.parse(trimmed);
            if (Array.isArray(decoded)) {
                return normalizeProductFeatures(decoded);
            }
        } catch {
            return [];
        }
    }

    return [];
}

export default function SingleProductDetailsPanel({
    product,
    colorLookup,
    colorRecords = [],
    selectedColor,
    onSelectColor,
    selectedSize,
    onSelectSize,
    quantity,
    onDecreaseQuantity,
    onIncreaseQuantity,
    onAddToCart,
}) {
    const [openAccordionKey, setOpenAccordionKey] = useState('description');
    const [isSizeChartModalOpen, setIsSizeChartModalOpen] = useState(false);

    const displayColors = Array.isArray(product.colors) && product.colors.length > 0
        ? product.colors
        : [{ label: 'Default', value: '#d4d4d8' }];

    const displaySizes = Array.isArray(product.sizes) && product.sizes.length > 0
        ? product.sizes
        : ['One Size'];

    const resolvedSizeChartImages = useMemo(() => {
        const mapping = product?.color_variant_size_charts && typeof product.color_variant_size_charts === 'object'
            ? product.color_variant_size_charts
            : {};
        const selected = String(selectedColor || '').trim();

        const selectedRecordByName = colorRecords.find(
            (record) => String(record?.name || '').trim().toLowerCase() === selected.toLowerCase(),
        );
        const selectedRecordById = colorRecords.find(
            (record) => String(record?.id || '').trim() === selected,
        );
        const matchedRecord = selectedRecordById || selectedRecordByName;

        const keys = [
            selected,
            selected.toLowerCase(),
            String(matchedRecord?.id || '').trim(),
            String(matchedRecord?.name || '').trim(),
            String(matchedRecord?.name || '').trim().toLowerCase(),
        ].filter(Boolean);

        const mappedItems = [];
        for (const key of keys) {
            const direct = mapping[key];
            if (Array.isArray(direct) && direct.length > 0) {
                mappedItems.push(...direct);
                continue;
            }

            const ciKey = Object.keys(mapping).find((itemKey) => itemKey.toLowerCase() === key.toLowerCase());
            if (ciKey && Array.isArray(mapping[ciKey]) && mapping[ciKey].length > 0) {
                mappedItems.push(...mapping[ciKey]);
            }
        }

        const normalizedMapped = [...new Set(mappedItems.map((item) => toOptionalImageUrl(item)).filter(Boolean))];
        return normalizedMapped;
    }, [product?.color_variant_size_charts, selectedColor, colorRecords]);

    const accordionItems = useMemo(() => {
        return [
            { key: 'description', title: 'Product Description', content: product?.description || '' },
            { key: 'fit', title: 'Fit', content: product?.fit || '' },
            { key: 'fabric', title: 'Fabric & Care', content: product?.fabric_and_care || '' },
            { key: 'composition', title: 'Product Composition', content: product?.product_composition || '' },
        ];
    }, [product]);

    const hasMultipleSizeCharts = resolvedSizeChartImages.length > 1;
    const normalizedProductFeatures = useMemo(
        () => normalizeProductFeatures(product?.product_features),
        [product?.product_features],
    );

    function toggleAccordionItem(key) {
        setOpenAccordionKey((previous) => (previous === key ? '' : key));
    }

    useEffect(() => {
        function handleEscape(event) {
            if (event.key === 'Escape') {
                setIsSizeChartModalOpen(false);
            }
        }

        const previousBodyOverflow = document.body.style.overflow;

        if (isSizeChartModalOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleEscape);
        } else {
            document.body.style.overflow = previousBodyOverflow;
        }

        return () => {
            window.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = previousBodyOverflow;
        };
    }, [isSizeChartModalOpen]);

    return (
        <div className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-4">
                 <h1 className="font-serif text-[2rem] uppercase leading-tight tracking-[0.02em] text-zinc-900 sm:text-[1.35rem]">
                     {product.name}
                </h1>

                <p className="text-[1.15rem] font-medium leading-none text-zinc-900">{product.price}</p>
            </div>
            
            <div className="mt-5 space-y-4">
                <div>
                    <h2 className="text-[0.75rem] tracking-[0.08em] text-zinc-800">Color Variations</h2>
                    <div className="mt-2.5 flex items-center gap-2.5">
                        {displayColors.map((color) => (
                            <button
                                key={color.label}
                                type="button"
                                onClick={() => onSelectColor(color.label)}
                                aria-label={`Select ${color.label} color`}
                                className={`inline-flex size-10 items-center justify-center rounded-full border-2 ${
                                    selectedColor === color.label
                                        ? 'border-zinc-950'
                                        : 'border-zinc-200 hover:border-zinc-500'
                                }`}
                            >
                                <span
                                    className="size-7 rounded-full border border-zinc-300"
                                    style={{ backgroundColor: resolveSwatchColor(color.value, colorLookup) }}
                                />
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <h2 className="text-[0.75rem] tracking-[0.08em] text-zinc-800">Size Variations</h2>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                        {displaySizes.map((size) => (
                            <button
                                key={size}
                                type="button"
                                onClick={() => onSelectSize(size)}
                                className={`inline-flex min-w-[60px] items-center justify-center border px-3 py-2.5 text-[0.95rem] font-medium uppercase ${
                                    selectedSize === size
                                        ? 'border-zinc-950 bg-zinc-950 text-white'
                                        : 'border-zinc-300 text-zinc-700 hover:border-zinc-900 hover:text-zinc-900'
                                }`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            if (resolvedSizeChartImages.length > 0) {
                                setIsSizeChartModalOpen(true);
                            }
                        }}
                        className={`mt-2.5 inline-flex items-center gap-2 text-[1rem] font-medium ${
                            resolvedSizeChartImages.length > 0
                                ? 'cursor-pointer text-zinc-800 hover:text-zinc-900'
                                : 'cursor-not-allowed text-zinc-400'
                        }`}
                        disabled={resolvedSizeChartImages.length === 0}
                    >
                        SIZE Chart <RulerIcon />
                    </button>
                </div>

                <div className="flex items-center gap-2.5">
                    <div className="inline-flex h-[52px] border border-zinc-300">
                        <button
                            type="button"
                            onClick={onDecreaseQuantity}
                            className="inline-flex w-[42px] items-center justify-center text-[1.2rem] text-zinc-700"
                        >
                            -
                        </button>
                        <span className="inline-flex w-[42px] items-center justify-center border-x border-zinc-300 text-[1.1rem] text-zinc-900">
                            {quantity}
                        </span>
                        <button
                            type="button"
                            onClick={onIncreaseQuantity}
                            className="inline-flex w-[42px] items-center justify-center text-[1.2rem] text-zinc-700"
                        >
                            +
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={onAddToCart}
                        className="inline-flex h-[52px] min-w-0 flex-1 cursor-pointer items-center justify-center bg-zinc-900 px-4 text-[0.95rem] font-semibold uppercase tracking-[0.05em] text-white shadow-sm transition-all duration-200 hover:bg-black hover:shadow-md active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 sm:px-6 sm:text-[1.05rem]"
                    >
                        Add To Cart
                    </button>

                    <button
                        type="button"
                        className="inline-flex size-[52px] shrink-0 items-center justify-center border border-zinc-300 text-[1.65rem] text-zinc-700 hover:border-zinc-600"
                        aria-label="Add to wishlist"
                    >
                        &#9825;
                    </button>
                </div>

                {/* Clean Product Features Grid without Background Card Wrapper */}
                {normalizedProductFeatures.length > 0 ? (
                    <div>
                        <h3 className="text-[0.75rem] tracking-[0.08em] uppercase text-zinc-800">
                            Product Features
                        </h3>
                        <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                            {normalizedProductFeatures.map((feature, index) => {
                                const Icon = resolveProductFeatureIcon(feature.icon);
                                return (
                                    <div key={`${feature.icon}-${index}`} className="flex items-start gap-2.5 text-[0.88rem] leading-5 text-zinc-700">
                                        <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-zinc-300 bg-white text-zinc-700">
                                            <Icon className="size-3.5" />
                                        </span>
                                        <span>{feature.text}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : null}

                <div className="mt-2 border-y border-zinc-200">
                    {accordionItems.map((item) => {
                        const isOpen = openAccordionKey === item.key;
                        const hasContent = String(item.content || '').trim() !== '';

                        return (
                            <div key={item.key} className="border-b border-zinc-200 last:border-b-0">
                                <button
                                    type="button"
                                    onClick={() => toggleAccordionItem(item.key)}
                                    className="flex w-full items-center justify-between py-4 text-left text-[0.96rem] font-medium text-zinc-800"
                                    aria-expanded={isOpen}
                                >
                                    <span>{item.title}</span>
                                    <span className="text-[1.2rem] leading-none text-zinc-500">{isOpen ? '-' : '+'}</span>
                                </button>

                                {isOpen ? (
                                    hasContent ? (
                                        <div
                                            className="pb-4 text-[0.95rem] leading-7 text-zinc-600"
                                            dangerouslySetInnerHTML={{ __html: item.content }}
                                        />
                                    ) : (
                                        <p className="pb-4 text-[0.95rem] text-zinc-500">No details available.</p>
                                    )
                                ) : null}
                            </div>
                        );
                    })}
                </div>

                <p className="border-t border-zinc-200 pt-2.5 text-[0.98rem] text-zinc-500">SKU: {product.sku || 'N/A'}</p>
            </div>

            {isSizeChartModalOpen ? (
                <div
                    className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto bg-black/65 px-4 py-8 sm:items-center sm:pt-12 lg:pt-16"
                    onClick={() => setIsSizeChartModalOpen(false)}
                >
                    <div
                        className={`relative mt-6 w-[min(92vw,980px)] rounded-xl bg-white p-3 shadow-2xl sm:mt-0 sm:p-4 ${
                            hasMultipleSizeCharts ? 'max-w-[92vw] lg:max-w-5xl' : 'max-w-[min(92vw,700px)]'
                        }`}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setIsSizeChartModalOpen(false)}
                            className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-300 text-lg text-zinc-700 transition hover:bg-zinc-100"
                            aria-label="Close size chart"
                        >
                            x
                        </button>

                        <h3 className="mb-3 pr-10 text-[1.05rem] font-semibold text-zinc-900">Size Chart</h3>

                        {resolvedSizeChartImages.length > 0 ? (
                            <div className="max-h-[78vh] overflow-auto rounded-lg border border-zinc-200 bg-zinc-50 p-2 sm:p-3">
                                <div className={`grid gap-3 ${hasMultipleSizeCharts ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
                                    {resolvedSizeChartImages.map((image, index) => (
                                        <img
                                            key={`${image}-${index}`}
                                            src={image}
                                            alt={`Product size chart ${index + 1}`}
                                            className="mx-auto block h-auto max-h-[72vh] w-auto max-w-full rounded-md object-contain"
                                        />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-zinc-500">No size chart available for this color variant.</p>
                        )}
                    </div>
                </div>
            ) : null}
        </div>
    );
}