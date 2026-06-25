import { ChevronLeft, ChevronRight, Eye, Heart, PackageSearch, SlidersHorizontal, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { useCart } from '../context/CartContext';
import { featuresFontClass } from '../utils/typography';
import ProductVariantModal from './ProductVariantModal.jsx';
import ShopSidebar from './ShopSidebar.jsx';
import { sectionTypography } from '../utils/sectionTypography';

const productImage = '/uploads/heroes/images/hero1.webp';
const PRODUCTS_PER_PAGE = 12;

function parseSizeList(value) {
    if (Array.isArray(value)) {
        return value
            .map((item) => String(item || '').trim().replace(/^"+|"+$/g, ''))
            .filter(Boolean);
    }

    if (typeof value === 'string' && value.trim()) {
        const raw = value.trim();

        if ((raw.startsWith('[') && raw.endsWith(']')) || (raw.startsWith('"') && raw.endsWith('"'))) {
            try {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                    return parsed
                        .map((item) => String(item || '').trim().replace(/^"+|"+$/g, ''))
                        .filter(Boolean);
                }

                if (typeof parsed === 'string') {
                    return parsed
                        .split(',')
                        .map((item) => item.trim().replace(/^"+|"+$/g, ''))
                        .filter(Boolean);
                }
            } catch {
                // Fall back to CSV parsing.
            }
        }

        return raw
            .split(',')
            .map((item) => item.trim().replace(/^"+|"+$/g, ''))
            .filter(Boolean);
    }

    return [];
}

function normalizeSizeId(value, sizeNameLookup = {}, sizeIdByNameLookup = {}) {
    const token = String(value || '').trim().replace(/^"+|"+$/g, '');
    if (!token) {
        return '';
    }

    if (sizeNameLookup[token]) {
        return token;
    }

    const byName = sizeIdByNameLookup[token.toLowerCase()];
    if (byName) {
        return byName;
    }

    const numeric = Number(token);
    if (Number.isInteger(numeric) && numeric > 0) {
        return String(numeric);
    }

    return token;
}

function parseColorList(value) {
    if (Array.isArray(value)) {
        return value
            .map((item) => String(item || '').trim().replace(/^"+|"+$/g, ''))
            .filter(Boolean);
    }

    if (typeof value === 'string' && value.trim()) {
        const raw = value.trim();

        if ((raw.startsWith('[') && raw.endsWith(']')) || (raw.startsWith('"') && raw.endsWith('"'))) {
            try {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                    return parsed
                        .map((item) => String(item || '').trim().replace(/^"+|"+$/g, ''))
                        .filter(Boolean);
                }

                if (typeof parsed === 'string') {
                    return parsed
                        .split(',')
                        .map((item) => item.trim().replace(/^"+|"+$/g, ''))
                        .filter(Boolean);
                }
            } catch {
                // Fall back to CSV parsing.
            }
        }

        return raw
            .split(',')
            .map((item) => item.trim().replace(/^"+|"+$/g, ''))
            .filter(Boolean);
    }

    return [];
}

function resolveColorDisplayName(value, colorNameLookup = {}) {
    const token = String(value || '').trim().replace(/^"+|"+$/g, '');
    if (!token) {
        return '';
    }

    return colorNameLookup[token] || token;
}

function extractSizeIds(product, sizeNameLookup = {}, sizeIdByNameLookup = {}) {
    const directSizes = parseSizeList(product?.size);
    if (directSizes.length > 0) {
        return [
            ...new Set(
                directSizes
                    .map((item) => normalizeSizeId(item, sizeNameLookup, sizeIdByNameLookup))
                    .filter(Boolean),
            ),
        ];
    }

    const variants = Array.isArray(product?.variant_rows) ? product.variant_rows : [];
    return [
        ...new Set(
            variants
                .flatMap((row) => parseSizeList(row?.size))
                .map((item) => normalizeSizeId(item, sizeNameLookup, sizeIdByNameLookup))
                .filter(Boolean),
        ),
    ];
}

function getProductStock(product) {
    if (Number.isFinite(Number(product?.stock))) {
        return Number(product.stock);
    }

    const variants = Array.isArray(product?.variant_rows) ? product.variant_rows : [];
    const variantStock = variants.reduce((total, row) => {
        const next = Number(row?.stock);
        return Number.isFinite(next) ? total + next : total;
    }, 0);

    return variantStock;
}

function collectVariantImages(product) {
    const images = [];

    if (product?.cover_image) {
        images.push(product.cover_image);
    }

    if (Array.isArray(product?.image_gallery)) {
        images.push(...product.image_gallery.filter(Boolean));
    }

    if (product?.color_variant_images && typeof product.color_variant_images === 'object') {
        Object.values(product.color_variant_images).forEach((items) => {
            if (Array.isArray(items)) {
                images.push(...items.filter(Boolean));
            }
        });
    }

    return images;
}

function buildVariantRowKey(row = {}) {
    const color = String(row?.color || '').trim().toLowerCase();
    const size = String(row?.size || '').trim().toLowerCase();
    const sku = String(row?.sku || '').trim().toLowerCase();

    if (sku) {
        return `sku:${sku}`;
    }

    return `${color}__${size}`;
}

function groupProductsByName(products, options = {}) {
    const {
        colorNameLookup = {},
        sizeNameLookup = {},
        sizeIdByNameLookup = {},
    } = options;
    const grouped = new Map();

    products.forEach((product, index) => {
        const name = String(product?.name || '').trim();
        const key = name.toLowerCase() || `unnamed-${product?.id ?? index}`;
        const existing = grouped.get(key);

        const productColors = normalizeProductColors(product?.color, colorNameLookup);
        const productSizes = extractSizeIds(product, sizeNameLookup, sizeIdByNameLookup);
        const productImages = collectVariantImages(product);
        const directVariantImages =
            product?.color_variant_images && typeof product.color_variant_images === 'object'
                ? Object.fromEntries(
                    Object.entries(product.color_variant_images)
                        .map(([key, images]) => [resolveColorDisplayName(key, colorNameLookup), images]),
                )
                : {};
        const productVariants = Array.isArray(product?.variant_rows) ? product.variant_rows : [];

        if (!existing) {
            grouped.set(key, {
                ...product,
                color: [...new Set(productColors)],
                sizes: [...new Set(productSizes)],
                image_gallery: [...new Set(Array.isArray(product?.image_gallery) ? product.image_gallery.filter(Boolean) : [])],
                color_variant_images: {},
                variant_rows: [...productVariants],
            });
        }

        const target = grouped.get(key);

        const mergedColors = new Set(normalizeProductColors(target.color, colorNameLookup));
        productColors.forEach((color) => mergedColors.add(color));
        target.color = [...mergedColors];

        const mergedSizes = new Set(parseSizeList(target.sizes));
        productSizes.forEach((size) => mergedSizes.add(size));
        target.sizes = [...mergedSizes];

        const mergedGallery = new Set(Array.isArray(target.image_gallery) ? target.image_gallery.filter(Boolean) : []);
        productImages.forEach((image) => mergedGallery.add(image));
        target.image_gallery = [...mergedGallery];

        if (!target.cover_image && product?.cover_image) {
            target.cover_image = product.cover_image;
        }

        const variantMap = {
            ...(target.color_variant_images && typeof target.color_variant_images === 'object' ? target.color_variant_images : {}),
        };

        productColors.forEach((color) => {
            const mappedImages = Array.isArray(directVariantImages[color]) ? directVariantImages[color].filter(Boolean) : [];
            const fallbackImages = mappedImages.length > 0 ? mappedImages : productImages;
            const merged = new Set(Array.isArray(variantMap[color]) ? variantMap[color].filter(Boolean) : []);

            fallbackImages.forEach((image) => merged.add(image));
            if (merged.size > 0) {
                variantMap[color] = [...merged];
            }
        });

        target.color_variant_images = variantMap;

        const mergedVariants = new Map(
            (Array.isArray(target.variant_rows) ? target.variant_rows : []).map((row) => [buildVariantRowKey(row), row]),
        );

        productVariants.forEach((row) => {
            const rowKey = buildVariantRowKey(row);
            if (!mergedVariants.has(rowKey)) {
                mergedVariants.set(rowKey, row);
            }
        });

        target.variant_rows = [...mergedVariants.values()];
        target.stockValue = getProductStock(target);
    });

    return [...grouped.values()];
}

function createVariantCardId(product, color, index) {
    const baseId = String(product?.id ?? `product-${index}`).trim();
    const colorSlug = String(color || 'default')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    return `${baseId}__${colorSlug || 'default'}__${index}`;
}

function expandProductsByColorVariants(products) {
    if (!Array.isArray(products)) {
        return [];
    }

    return products.flatMap((product, productIndex) => {
        const colors = normalizeProductColors(product?.color);
        if (colors.length === 0) {
            return [{
                ...product,
                variant_seed_color: null,
            }];
        }

        return colors.map((color, colorIndex) => ({
            ...product,
            id: createVariantCardId(product, color, colorIndex),
            variant_seed_color: color,
            base_product_id: product?.id ?? productIndex,
        }));
    });
}

function normalizeProducts(payload, colorNameLookup = {}, sizeNameLookup = {}, sizeIdByNameLookup = {}) {
    if (!Array.isArray(payload)) {
        return [];
    }

    const normalized = payload.map((item, index) => {
        const normalizedColorVariantImages =
            item?.color_variant_images && typeof item.color_variant_images === 'object'
                ? Object.fromEntries(
                    Object.entries(item.color_variant_images)
                        .map(([key, images]) => [resolveColorDisplayName(key, colorNameLookup), images]),
                )
                : {};

        const normalizedVariantRows = Array.isArray(item?.variant_rows)
            ? item.variant_rows.map((row) => ({
                ...row,
                color: resolveColorDisplayName(row?.color, colorNameLookup),
            }))
            : [];

        return {
            ...item,
            id: item?.id ?? `product-${index}`,
            name: String(item?.name || '').trim() || 'Untitled Product',
            priceValue: Number(item?.price) || 0,
            price: `$${(Number(item?.price) || 0).toFixed(2)}`,
            cover_image: item?.cover_image || null,
            image_gallery: Array.isArray(item?.image_gallery) ? item.image_gallery : [],
            color: normalizeProductColors(item?.color, colorNameLookup),
            color_variant_images: normalizedColorVariantImages,
            variant_rows: normalizedVariantRows,
            sizes: extractSizeIds(item, sizeNameLookup, sizeIdByNameLookup),
            stockValue: getProductStock(item),
            grand_child_id: item?.grand_child_id != null ? String(item.grand_child_id) : '',
            tag: item?.show_on_best_sellers ? 'Best Seller' : null,
        };
    });

    return expandProductsByColorVariants(
        groupProductsByName(normalized, {
            colorNameLookup,
            sizeNameLookup,
            sizeIdByNameLookup,
        }),
    );
}

function normalizeSizeOptions(payload) {
    const list = Array.isArray(payload)
        ? payload
        : (Array.isArray(payload?.data) ? payload.data : []);

    const byId = new Map();

    list.forEach((item) => {
        const id = String(item?.id ?? '').trim();
        const name = String(item?.size ?? item?.Size ?? item?.name ?? '').trim();

        if (!id || !name) {
            return;
        }

        byId.set(id, { id, name });
    });

    return [...byId.values()];
}

function normalizeGrandChildOptions(payload) {
    if (!Array.isArray(payload)) {
        return [];
    }

    return payload
        .map((item) => ({
            id: String(item?.id ?? ''),
            name: String(item?.name || '').trim(),
        }))
        .filter((item) => item.id && item.name);
}

function normalizeQueryValue(value) {
    return String(value || '').trim().toLowerCase();
}

function resolveEntityByQuery(items, rawValue) {
    const needle = normalizeQueryValue(rawValue);
    if (!needle) {
        return null;
    }

    return (
        items.find((item) => normalizeQueryValue(item?.id) === needle)
        || items.find((item) => normalizeQueryValue(item?.slug) === needle)
        || items.find((item) => normalizeQueryValue(item?.name) === needle)
        || null
    );
}

function normalizeProductColors(value, colorNameLookup = {}) {
    return parseColorList(value)
        .map((item) => resolveColorDisplayName(item, colorNameLookup))
        .filter(Boolean);
}

function normalizeColorLookupEntry(record) {
    if (!record || typeof record !== 'object') {
        return null;
    }

    const name = String(record.name || '').trim();
    const colorCode = String(record.color_code || '').trim();

    if (!name || !/^#[0-9a-f]{6}$/i.test(colorCode)) {
        return null;
    }

    return [name.toLowerCase(), colorCode];
}

function normalizeColorNameLookupEntry(record) {
    if (!record || typeof record !== 'object') {
        return null;
    }

    const id = String(record.id ?? '').trim();
    const name = String(record.name || '').trim();

    if (!id || !name) {
        return null;
    }

    return [id, name];
}

function getSwatchColor(value, colorLookup = {}) {
    if (typeof value !== 'string') {
        return '#d4d4d8';
    }

    const trimmed = value.trim();
    if (/^#[0-9a-f]{6}$/i.test(trimmed)) {
        return trimmed;
    }

    const mappedColor = colorLookup[trimmed.toLowerCase()];
    if (mappedColor) {
        return mappedColor;
    }

    if (/^[a-z]+$/i.test(trimmed)) {
        return trimmed.toLowerCase();
    }

    return '#d4d4d8';
}

function toAbsoluteImageUrl(path) {
    if (!path || typeof path !== 'string') {
        return productImage;
    }

    if (path.startsWith('http')) {
        return path;
    }

    return `/${path.replace(/^\/+/, '')}`;
}

function normalizeImageKey(path) {
    if (!path || typeof path !== 'string') {
        return '';
    }

    return path.replace(/^https?:\/\/[^/]+/i, '').replace(/^\/+/, '').trim();
}

function isBestSellerProduct(product) {
    if (!product || typeof product !== 'object') {
        return false;
    }

    if (product.show_on_best_sellers === true) {
        return true;
    }

    return Number(product.show_on_best_sellers) === 1;
}

function ColorSwatch({ color, active, onClick, colorLookup, colorNameLookup = {} }) {
    const displayColor = resolveColorDisplayName(color, colorNameLookup);

    return (
        <button
            type="button"
            title={displayColor}
            onClick={onClick}
            className={`inline-block size-5 rounded-full border shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)] transition-transform hover:scale-110 sm:size-[1.35rem] ${
                active ? 'border-zinc-900 ring-1 ring-zinc-900/25' : 'border-zinc-200'
            }`}
            style={{ backgroundColor: getSwatchColor(displayColor, colorLookup) }}
        />
    );
}

function ProductCard({ product, colorLookup = {}, colorNameLookup = {}, onAddToCart }) {
    const navigate = useNavigate();
    const colors = useMemo(() => normalizeProductColors(product.color), [product.color]);

    const galleryImages = useMemo(() => {
        const rawGallery = Array.isArray(product.image_gallery) ? product.image_gallery : [];
        const allCandidates = [product.cover_image, ...rawGallery].filter(Boolean);
        const seen = new Set();
        const deduped = [];

        allCandidates.forEach((item) => {
            const key = normalizeImageKey(item);
            if (!key || seen.has(key)) {
                return;
            }

            seen.add(key);
            deduped.push(item);
        });

        if (deduped.length === 0) {
            return [productImage];
        }

        return deduped.map((item) => toAbsoluteImageUrl(item));
    }, [product.cover_image, product.image_gallery]);

    const colorVariantImages =
        product.color_variant_images && typeof product.color_variant_images === 'object'
            ? product.color_variant_images
            : {};

    const initialSeedColor = useMemo(() => {
        const seededColor = String(product?.variant_seed_color || '').trim();
        if (seededColor && colors.includes(seededColor)) {
            return seededColor;
        }

        return colors[0] || null;
    }, [product?.variant_seed_color, colors]);

    const initialImageIndex = useMemo(() => {
        if (!initialSeedColor) {
            return 0;
        }

        const mappedImages = Array.isArray(colorVariantImages[initialSeedColor])
            ? colorVariantImages[initialSeedColor]
            : [];

        if (mappedImages.length === 0) {
            return 0;
        }

        const targetIndex = galleryImages.findIndex(
            (image) => normalizeImageKey(image) === normalizeImageKey(mappedImages[0]),
        );

        return targetIndex >= 0 ? targetIndex : 0;
    }, [initialSeedColor, colorVariantImages, galleryImages]);

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [selectedColor, setSelectedColor] = useState(() => initialSeedColor);

    useEffect(() => {
        setCurrentImageIndex(initialImageIndex);
        setSelectedColor(initialSeedColor);
    }, [product.id, product.color, initialImageIndex, initialSeedColor]);

    useEffect(() => {
        const currentImage = galleryImages[currentImageIndex];
        if (!currentImage) {
            return;
        }

        const currentImageKey = normalizeImageKey(currentImage);
        if (!currentImageKey) {
            return;
        }

        const matchedColor = colors.find((color) => {
            const mappedImages = Array.isArray(colorVariantImages[color]) ? colorVariantImages[color] : [];
            return mappedImages.some((image) => normalizeImageKey(image) === currentImageKey);
        });

        if (matchedColor && matchedColor !== selectedColor) {
            setSelectedColor(matchedColor);
        }
    }, [currentImageIndex, galleryImages, colors, colorVariantImages, selectedColor]);

    const imageSrc = galleryImages[currentImageIndex] || productImage;

    function handlePrevImage(event) {
        event.preventDefault();
        event.stopPropagation();
        setCurrentImageIndex((previous) =>
            previous === 0 ? galleryImages.length - 1 : previous - 1,
        );
    }

    function handleNextImage(event) {
        event.preventDefault();
        event.stopPropagation();
        setCurrentImageIndex((previous) =>
            previous === galleryImages.length - 1 ? 0 : previous + 1,
        );
    }

    function handleSelectColor(color, event) {
        event.preventDefault();
        event.stopPropagation();
        setSelectedColor(color);

        const mappedImages = Array.isArray(colorVariantImages[color]) ? colorVariantImages[color] : [];
        if (mappedImages.length === 0) {
            return;
        }

        const firstMapped = mappedImages[0];
        const targetIndex = galleryImages.findIndex(
            (image) => normalizeImageKey(image) === normalizeImageKey(firstMapped),
        );

        if (targetIndex >= 0) {
            setCurrentImageIndex(targetIndex);
        }
    }

    const productSlug = String(product?.slug || '').trim();
    const productName = String(product?.name || '').trim();
    const productLink = useMemo(() => {
        const base = productSlug
            ? `/product-details/${encodeURIComponent(productSlug)}`
            : `/product-details/${encodeURIComponent(productName)}`;

        const colorValue = String(selectedColor || '').trim();
        if (!colorValue) {
            return base;
        }

        return `${base}/${encodeURIComponent(colorValue)}`;
    }, [productSlug, productName, selectedColor]);

    function handleAddToCart(event) {
        event.preventDefault();
        event.stopPropagation();

        onAddToCart?.(product, {
            selectedColor,
            quantity: 1,
            image: imageSrc,
        });
    }

    function handleQuickView(event) {
        event.preventDefault();
        event.stopPropagation();
        navigate(productLink);
    }

    function handleWishlist(event) {
        event.preventDefault();
        event.stopPropagation();
        toast.info('Wishlist will be available soon');
    }

    return (
        <article className="group overflow-hidden border border-zinc-200 bg-white">
            <Link to={productLink} className="block">
                <div className="relative overflow-hidden bg-zinc-100">
                    <img
                        src={imageSrc}
                        alt={product.name}
                        className="h-[250px] w-full object-cover object-center transition-transform duration-500 group-hover:scale-105 sm:h-[320px]"
                    />

                    <div className="product-hover-cta absolute inset-x-3 bottom-3 flex translate-y-3 items-center justify-center gap-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                        <button
                            type="button"
                            onClick={handleAddToCart}
                            className="inline-flex h-9 items-center justify-center bg-zinc-900 px-4 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-white transition-colors duration-200 hover:bg-zinc-800"
                        >
                            Add to cart
                        </button>
                        <button
                            type="button"
                            onClick={handleWishlist}
                            aria-label="Add to wishlist"
                            className="inline-flex size-9 items-center justify-center border border-zinc-200 bg-white text-zinc-700 transition-colors duration-200 hover:text-zinc-950"
                        >
                            <Heart className="size-4" />
                        </button>
                        <button
                            type="button"
                            onClick={handleQuickView}
                            aria-label="Preview product"
                            className="inline-flex size-9 items-center justify-center border border-zinc-200 bg-white text-zinc-700 transition-colors duration-200 hover:text-zinc-950"
                        >
                            <Eye className="size-4" />
                        </button>
                    </div>

                    {product.tag ? (
                        <span className="absolute left-3 top-3 bg-zinc-950 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-white">
                            {product.tag}
                        </span>
                    ) : null}

                    {galleryImages.length > 1 ? (
                        <>
                            <button
                                type="button"
                                aria-label="Previous image"
                                onClick={handlePrevImage}
                                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/85 p-1.5 text-zinc-800 opacity-0 shadow transition-opacity group-hover:opacity-100"
                            >
                                <ChevronLeft className="size-4" />
                            </button>
                            <button
                                type="button"
                                aria-label="Next image"
                                onClick={handleNextImage}
                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/85 p-1.5 text-zinc-800 opacity-0 shadow transition-opacity group-hover:opacity-100"
                            >
                                <ChevronRight className="size-4" />
                            </button>

                            {/* <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-black/30 px-2 py-1">
                                {galleryImages.map((_, index) => (
                                    <button
                                        key={`image-dot-${index}`}
                                        type="button"
                                        onClick={(event) => {
                                            event.preventDefault();
                                            event.stopPropagation();
                                            setCurrentImageIndex(index);
                                        }}
                                        className={`size-1.5 rounded-full ${
                                            currentImageIndex === index ? 'bg-white' : 'bg-white/50'
                                        }`}
                                        aria-label={`Go to image ${index + 1}`}
                                    />
                                ))}
                            </div> */}
                        </>
                    ) : null}
                </div>
            </Link>

            <div className="space-y-1 p-4 pt-3.5">
                {colors.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                        {colors.slice(0, 6).map((c, i) => (
                            <ColorSwatch
                                key={`${c}-${i}`}
                                color={c}
                                active={selectedColor === c}
                                colorLookup={colorLookup}
                                colorNameLookup={colorNameLookup}
                                onClick={(event) => handleSelectColor(c, event)}
                            />
                        ))}
                    </div>
                )}

                  <Link to={productLink} className="block">
                    <h3 className={`${sectionTypography.productName} line-clamp-2 text-[0.95rem] font-medium leading-[1.15] text-zinc-900 transition-opacity hover:opacity-70 sm:text-[1.02rem]`}>
                        {product.name}
                    </h3>
                </Link>

                <p className={`${sectionTypography.productPrice} text-[1.2rem] font-semibold leading-none text-zinc-800 sm:text-[.95rem]`}>
                    ${Number(product.priceValue).toFixed(2)}
                </p>
            </div>
        </article>
    );
}

function ShopProductsGrid({
    products = [],
    colorLookup = {},
    colorNameLookup = {},
    currentPage = 1,
    totalPages = 1,
    totalResults = 0,
    onPageChange,
    onAddToCart,
    onOpenFilters,
}) {
    const visibleProducts = Array.isArray(products) ? products : [];
    const start = visibleProducts.length > 0 ? (currentPage - 1) * PRODUCTS_PER_PAGE + 1 : 0;
    const end = visibleProducts.length > 0 ? start + visibleProducts.length - 1 : 0;

    return (
        <div>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3  py-4">
                <p className="text-[0.88rem]  tracking-[0.07em] text-slate-600">
                    Showing {start}-{end} of {totalResults} results
                </p>

                <button
                    type="button"
                    onClick={() => onOpenFilters?.()}
                    className="inline-flex items-center gap-2 bg-zinc-950 px-3.5 py-2 text-[0.72rem] font-medium uppercase tracking-[0.14em] text-white lg:hidden"
                >
                    <SlidersHorizontal className="size-4" strokeWidth={1.7} />
                    Filters
                </button>
            </div>

            {visibleProducts.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                    {visibleProducts.map((product) => (
                        <ProductCard key={product.id} product={product} colorLookup={colorLookup} colorNameLookup={colorNameLookup} onAddToCart={onAddToCart} />
                    ))}
                </div>
            ) : (
                <div className="flex min-h-[420px] flex-col items-center justify-center rounded-md border border-zinc-200 bg-white text-center">
                    <PackageSearch className="mb-4 size-24 text-zinc-300" strokeWidth={1.5} />
                    <h3 className="text-[1.1rem] font-semibold uppercase tracking-[0.08em] text-zinc-700">No product found</h3>
                    <p className="mt-2 text-sm text-zinc-500">Try changing filters or search keywords.</p>
                </div>
            )}

            {totalPages > 1 ? (
                <div className="mt-8 flex items-center justify-center gap-2">
                    {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                        <button
                            key={page}
                            type="button"
                            onClick={() => onPageChange?.(page)}
                            className={`inline-flex h-10 min-w-10 items-center justify-center border px-3 text-[0.75rem] font-semibold uppercase tracking-[0.14em] ${
                                page === currentPage
                                    ? 'border-zinc-900 bg-zinc-900 text-white'
                                    : 'border-zinc-300 bg-white text-zinc-700 hover:border-zinc-500'
                            }`}
                        >
                            {page}
                        </button>
                    ))}
                </div>
            ) : null}
        </div>
    );
}

export default function ShopCatalogSection() {
    const { addToCart, openCartDrawer } = useCart();
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [colorLookup, setColorLookup] = useState({});
    const [colorNameLookup, setColorNameLookup] = useState({});
    const [allCategories, setAllCategories] = useState([]);
    const [allSubCategories, setAllSubCategories] = useState([]);
    const [allGrandChilds, setAllGrandChilds] = useState([]);
    const [sizeOptions, setSizeOptions] = useState([]);
    const [sizeNameLookup, setSizeNameLookup] = useState({});
    const [sizeIdByNameLookup, setSizeIdByNameLookup] = useState({});
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [selectedAvailability, setSelectedAvailability] = useState([]);
    const [selectedSizes, setSelectedSizes] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [minPrice, setMinPrice] = useState('0');
    const [maxPrice, setMaxPrice] = useState('59.99');
    const [highestDbPrice, setHighestDbPrice] = useState('0.00');
    const [currentPage, setCurrentPage] = useState(1);
    const [variantModalState, setVariantModalState] = useState(null);
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
    const [collectionItems, setCollectionItems] = useState([]);

    const collectionSlug = useMemo(() => {
        const segments = String(location.pathname || '').split('/').filter(Boolean);
        if (segments.length === 1 && String(segments[0]).toLowerCase() === 'new-arrivals') {
            return 'new-arrivals';
        }

        if (segments.length < 2 || String(segments[0]).toLowerCase() !== 'collection') {
            return '';
        }

        try {
            return decodeURIComponent(String(segments[1] || '')).trim();
        } catch {
            return String(segments[1] || '').trim();
        }
    }, [location.pathname]);

    const isCollectionView = Boolean(collectionSlug);

    const isBestSellersView = useMemo(() => {
        const pathName = String(location.pathname || '').toLowerCase();
        if (pathName === '/best-sellers') {
            return true;
        }

        const params = new URLSearchParams(location.search);
        return normalizeQueryValue(params.get('category')) === 'best-sellers';
    }, [location.pathname, location.search]);

    useEffect(() => {
        let ignore = false;

        async function loadShopData() {
            try {
                if (!ignore) {
                    setIsLoading(true);
                }

                const [sizesRes, categoriesRes, subCategoriesRes, grandChildsRes, productsRes, collectionsRes, colorsRes] = await Promise.all([
                    fetch('/api/public/sizes', { headers: { Accept: 'application/json' } }),
                    fetch('/api/public/categories', { headers: { Accept: 'application/json' } }),
                    fetch('/api/public/sub-categories', { headers: { Accept: 'application/json' } }),
                    fetch('/api/public/grand-childs', { headers: { Accept: 'application/json' } }),
                    fetch('/api/public/shop-products', { headers: { Accept: 'application/json' } }),
                    fetch('/api/public/collections', { headers: { Accept: 'application/json' } }),
                    fetch('/api/public/colors', { headers: { Accept: 'application/json' } }),
                ]);

                const [sizesPayload, categoriesPayload, subCategoriesPayload, grandChildsPayload, productsPayload, collectionsPayload, colorsPayload] = await Promise.all([
                    sizesRes.ok ? sizesRes.json() : [],
                    categoriesRes.ok ? categoriesRes.json() : [],
                    subCategoriesRes.ok ? subCategoriesRes.json() : [],
                    grandChildsRes.ok ? grandChildsRes.json() : [],
                    productsRes.ok ? productsRes.json() : [],
                    collectionsRes.ok ? collectionsRes.json() : [],
                    colorsRes.ok ? colorsRes.json() : [],
                ]);

                if (ignore) {
                    return;
                }

                const colorList = Array.isArray(colorsPayload)
                    ? colorsPayload
                    : (Array.isArray(colorsPayload?.data) ? colorsPayload.data : []);

                const nextColorLookup = Object.fromEntries(
                    colorList
                        .map(normalizeColorLookupEntry)
                        .filter(Boolean),
                );

                const nextColorNameLookup = Object.fromEntries(
                    colorList
                        .map(normalizeColorNameLookupEntry)
                        .filter(Boolean),
                );

                const nextSizeOptions = normalizeSizeOptions(sizesPayload);
                const nextSizeNameLookup = Object.fromEntries(
                    nextSizeOptions
                        .map((item) => [String(item.id), String(item.name)]),
                );
                const nextSizeIdByNameLookup = Object.fromEntries(
                    nextSizeOptions
                        .map((item) => [String(item.name).trim().toLowerCase(), String(item.id)]),
                );

                const normalizedProducts = normalizeProducts(
                    productsPayload,
                    nextColorNameLookup,
                    nextSizeNameLookup,
                    nextSizeIdByNameLookup,
                );

                setSizeOptions(nextSizeOptions);
                setSizeNameLookup(nextSizeNameLookup);
                setSizeIdByNameLookup(nextSizeIdByNameLookup);
                setAllCategories(Array.isArray(categoriesPayload) ? categoriesPayload : []);
                setAllSubCategories(Array.isArray(subCategoriesPayload) ? subCategoriesPayload : []);
                setAllGrandChilds(Array.isArray(grandChildsPayload) ? grandChildsPayload : []);
                setCategoryOptions(normalizeGrandChildOptions(grandChildsPayload));
                setProducts(normalizedProducts);
                setColorLookup(nextColorLookup);
                setColorNameLookup(nextColorNameLookup);
                setCollectionItems(
                    Array.isArray(collectionsPayload?.items)
                        ? collectionsPayload.items.map((item) => ({
                            slug: String(item?.slug || '').trim(),
                            name: String(item?.name || '').trim(),
                            productIds: Array.isArray(item?.productIds)
                                ? item.productIds
                                    .map((value) => Number(value))
                                    .filter((value) => Number.isInteger(value) && value > 0)
                                : [],
                        }))
                        : [],
                );

                const prices = normalizedProducts
                    .map((item) => Number(item.priceValue))
                    .filter((value) => Number.isFinite(value));

                if (prices.length > 0) {
                    const minDb = Math.min(...prices);
                    const maxDb = Math.max(...prices);
                    setMinPrice(minDb.toFixed(2));
                    setMaxPrice(maxDb.toFixed(2));
                    setHighestDbPrice(maxDb.toFixed(2));
                } else {
                    setMinPrice('0.00');
                    setMaxPrice('0.00');
                    setHighestDbPrice('0.00');
                }

            } catch {
                if (ignore) {
                    return;
                }

                setSizeOptions([]);
                setSizeNameLookup({});
                setSizeIdByNameLookup({});
                setAllCategories([]);
                setAllSubCategories([]);
                setAllGrandChilds([]);
                setCategoryOptions([]);
                setProducts([]);
                setCollectionItems([]);
                setColorLookup({});
                setColorNameLookup({});
                setMinPrice('0.00');
                setMaxPrice('0.00');
                setHighestDbPrice('0.00');
            }

            if (!ignore) {
                setIsLoading(false);
            }
        }

        loadShopData();

        return () => {
            ignore = true;
        };
    }, []);

    const activeCollection = useMemo(() => {
        if (!isCollectionView) {
            return null;
        }

        const needle = normalizeQueryValue(collectionSlug);
        if (!needle) {
            return null;
        }

        return (
            collectionItems.find((item) => normalizeQueryValue(item.slug) === needle)
            || collectionItems.find((item) => normalizeQueryValue(item.name) === needle)
            || null
        );
    }, [isCollectionView, collectionSlug, collectionItems]);

    const activeCollectionProductIdSet = useMemo(() => {
        if (!activeCollection) {
            return new Set();
        }

        return new Set(
            (Array.isArray(activeCollection.productIds) ? activeCollection.productIds : [])
                .map((value) => Number(value))
                .filter((value) => Number.isInteger(value) && value > 0),
        );
    }, [activeCollection]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const pathName = String(location.pathname || '').toLowerCase();
        const categoryValueFromPath = pathName === '/best-sellers' ? 'best-sellers' : '';
        const pathSegments = pathName.split('/').filter(Boolean);
        const isSearchPath = pathSegments.length >= 2 && pathSegments[0] === 'search';
        const searchPathToken = isSearchPath
            ? (() => {
                try {
                    return decodeURIComponent(pathSegments.slice(1).join('/')).trim();
                } catch {
                    return String(pathSegments.slice(1).join('/') || '').trim();
                }
            })()
            : '';
        const isShopPathSegment = !['collection', 'best-sellers', 'shop', 'search'].includes(pathSegments[0]);
        const subCategoryValueFromPath = pathSegments.length >= 1 && isShopPathSegment ? pathSegments[0] : '';
        const grandChildValueFromPath = pathSegments.length >= 2 && isShopPathSegment ? pathSegments[1] : '';
        const categoryValue = categoryValueFromPath || params.get('category');
        const subCategoryValue = subCategoryValueFromPath || params.get('sub_category');
        const grandChildValue = grandChildValueFromPath || params.get('grand_child');
        const rawSearch = (isSearchPath ? searchPathToken.replace(/-/g, ' ') : '') || params.get('search') || params.get('q') || '';
        const sizeValue = params.get('size') || '';

        setSearchTerm(rawSearch.trim());

        if (sizeValue.trim()) {
            const requestedSizes = sizeValue
                .split(',')
                .map((item) => normalizeSizeId(item, sizeNameLookup, sizeIdByNameLookup))
                .filter(Boolean);
            setSelectedSizes([...new Set(requestedSizes)]);
        } else {
            setSelectedSizes([]);
        }

        const selectedGrandChildIds = new Set();

        if (grandChildValue) {
            const matchedGrandChild = resolveEntityByQuery(allGrandChilds, grandChildValue);
            if (matchedGrandChild?.id != null) {
                selectedGrandChildIds.add(String(matchedGrandChild.id));
            }
        } else if (subCategoryValue) {
            const matchedSubCategory = resolveEntityByQuery(allSubCategories, subCategoryValue);
            if (matchedSubCategory?.id != null) {
                allGrandChilds.forEach((item) => {
                    const subId = String(item?.sub_category_id ?? item?.child_id ?? '');
                    if (subId === String(matchedSubCategory.id)) {
                        selectedGrandChildIds.add(String(item.id));
                    }
                });
            }
        } else if (categoryValue) {
            const matchedCategory = resolveEntityByQuery(allCategories, categoryValue);
            if (matchedCategory?.id != null) {
                allGrandChilds.forEach((item) => {
                    if (String(item?.category_id ?? '') === String(matchedCategory.id)) {
                        selectedGrandChildIds.add(String(item.id));
                    }
                });
            }
        }

        setSelectedCategories([...selectedGrandChildIds]);
        setCurrentPage(1);
    }, [location.pathname, location.search, allCategories, allSubCategories, allGrandChilds, sizeNameLookup, sizeIdByNameLookup]);

    function toggleSelected(setter, value) {
        setter((previous) =>
            previous.includes(value)
                ? previous.filter((item) => item !== value)
                : [...previous, value],
        );
        setCurrentPage(1);
    }

    const filteredProducts = useMemo(() => {
        const min = Number(minPrice);
        const max = Number(maxPrice);
        const hasMin = Number.isFinite(min);
        const hasMax = Number.isFinite(max);

        return products.filter((product) => {
            if (isCollectionView) {
                if (!activeCollection || activeCollectionProductIdSet.size === 0) {
                    return false;
                }

                const sourceProductId = Number(product.base_product_id ?? product.id);
                if (!activeCollectionProductIdSet.has(sourceProductId)) {
                    return false;
                }
            }

            if (isBestSellersView && !isBestSellerProduct(product)) {
                return false;
            }

            if (selectedAvailability.length > 0) {
                const inStock = product.stockValue > 0;
                const matchesAvailability = selectedAvailability.some((value) =>
                    value === 'In stock' ? inStock : !inStock,
                );

                if (!matchesAvailability) {
                    return false;
                }
            }

            if (selectedSizes.length > 0) {
                const productSizeIds = parseSizeList(product?.sizes)
                    .map((size) => normalizeSizeId(size, sizeNameLookup, sizeIdByNameLookup))
                    .filter(Boolean);

                const matchesSize = productSizeIds.some((sizeId) => selectedSizes.includes(sizeId));
                if (!matchesSize) {
                    return false;
                }
            }

            if (selectedCategories.length > 0) {
                if (!selectedCategories.includes(product.grand_child_id)) {
                    return false;
                }
            }

            if (searchTerm) {
                const haystack = `${product.name} ${product.sku || ''}`.toLowerCase();
                if (!haystack.includes(searchTerm.toLowerCase())) {
                    return false;
                }
            }

            if (hasMin && product.priceValue < min) {
                return false;
            }

            if (hasMax && product.priceValue > max) {
                return false;
            }

            return true;
        });
    }, [
        products,
        selectedAvailability,
        selectedSizes,
        selectedCategories,
        minPrice,
        maxPrice,
        searchTerm,
        sizeNameLookup,
        sizeIdByNameLookup,
        isCollectionView,
        activeCollection,
        activeCollectionProductIdSet,
        isBestSellersView,
    ]);

    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
    const safeCurrentPage = Math.min(currentPage, totalPages);

    useEffect(() => {
        if (currentPage !== safeCurrentPage) {
            setCurrentPage(safeCurrentPage);
        }
    }, [currentPage, safeCurrentPage]);

    const paginatedProducts = useMemo(() => {
        const startIndex = (safeCurrentPage - 1) * PRODUCTS_PER_PAGE;
        return filteredProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
    }, [filteredProducts, safeCurrentPage]);

    function handleAddToCart(product, options = {}) {
        setVariantModalState({
            product,
            defaults: options,
        });
    }

    function handleConfirmVariant(options = {}) {
        if (!variantModalState?.product) {
            return;
        }

        const nextItem = addToCart(variantModalState.product, options);
        setVariantModalState(null);
        toast.success(`${nextItem.name} added to cart`);
        openCartDrawer();
    }

    useEffect(() => {
        if (!isMobileFiltersOpen) {
            document.body.style.removeProperty('overflow');
            return;
        }

        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.removeProperty('overflow');
        };
    }, [isMobileFiltersOpen]);

    if (isLoading) {
        return (
            <section className={`${featuresFontClass} px-5 py-12 sm:px-8 lg:px-12 lg:py-16`}>
                <div className="mx-auto grid w-full max-w-[1709px] animate-pulse gap-8 lg:grid-cols-[360px_1fr] lg:gap-10">
                    <div className="space-y-4 rounded border border-zinc-200 bg-white p-5">
                        <div className="h-5 w-28 rounded bg-zinc-200" />
                        <div className="h-10 rounded bg-zinc-200" />
                        <div className="h-10 rounded bg-zinc-200" />
                        <div className="h-10 rounded bg-zinc-200" />
                        <div className="h-10 rounded bg-zinc-200" />
                        <div className="h-10 rounded bg-zinc-200" />
                    </div>

                    <div>
                        <div className="mb-5 flex items-center justify-between gap-3 py-4">
                            <div className="h-4 w-52 rounded bg-zinc-200" />
                            <div className="h-9 w-28 rounded bg-zinc-200" />
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            {Array.from({ length: 8 }).map((_, index) => (
                                <article key={`shop-card-skeleton-${index}`} className="overflow-hidden border border-zinc-200 bg-white">
                                    <div className="h-[250px] bg-zinc-200 sm:h-[320px]" />
                                    <div className="space-y-2 p-4">
                                        <div className="h-3.5 w-[80%] rounded bg-zinc-200" />
                                        <div className="h-3.5 w-20 rounded bg-zinc-200" />
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className={`${featuresFontClass} px-5 py-12 sm:px-8 lg:px-12 lg:py-16`}>
            <div className="mx-auto grid w-full max-w-[1709px] gap-8 lg:grid-cols-[360px_1fr] lg:gap-10">
                <div className="hidden lg:block">
                    <ShopSidebar
                        sizeOptions={sizeOptions}
                        categoryOptions={categoryOptions}
                        selectedAvailability={selectedAvailability}
                        selectedSizes={selectedSizes}
                        selectedCategories={selectedCategories}
                        minPrice={minPrice}
                        maxPrice={maxPrice}
                        highestPrice={highestDbPrice}
                        onToggleAvailability={(value) => toggleSelected(setSelectedAvailability, value)}
                        onToggleSize={(value) => toggleSelected(setSelectedSizes, value)}
                        onToggleCategory={(value) => toggleSelected(setSelectedCategories, value)}
                        onMinPriceChange={(value) => {
                            setMinPrice(value);
                            setCurrentPage(1);
                        }}
                        onMaxPriceChange={(value) => {
                            setMaxPrice(value);
                            setCurrentPage(1);
                        }}
                    />
                </div>
                <ShopProductsGrid
                    products={paginatedProducts}
                    colorLookup={colorLookup}
                    colorNameLookup={colorNameLookup}
                    currentPage={safeCurrentPage}
                    totalPages={totalPages}
                    totalResults={filteredProducts.length}
                    onPageChange={setCurrentPage}
                    onAddToCart={handleAddToCart}
                    onOpenFilters={() => setIsMobileFiltersOpen(true)}
                />

                <ProductVariantModal
                    isOpen={Boolean(variantModalState?.product)}
                    product={variantModalState?.product || null}
                    colorLookup={colorLookup}
                    defaults={variantModalState?.defaults || {}}
                    onClose={() => setVariantModalState(null)}
                    onConfirm={handleConfirmVariant}
                />
            </div>

            <div
                className={`fixed inset-0 z-[1300] bg-black/35 transition-opacity duration-200 lg:hidden ${
                    isMobileFiltersOpen ? 'visible opacity-100 pointer-events-auto' : 'invisible opacity-0 pointer-events-none'
                }`}
                onClick={() => setIsMobileFiltersOpen(false)}
                aria-hidden="true"
            />

            <aside
                aria-label="Mobile filters"
                className={`fixed inset-y-0 left-0 z-[1310] h-screen w-[88vw] max-w-[380px] overflow-y-auto bg-[#f4f4f4] shadow-[18px_0_48px_rgba(0,0,0,0.15)] transition-transform duration-300 lg:hidden ${
                    isMobileFiltersOpen ? 'translate-x-0 pointer-events-auto' : '-translate-x-full pointer-events-none'
                }`}
            >
                <div className="flex items-center justify-between border-b border-zinc-200/80 px-4 py-4">
                    <h3 className="text-[0.95rem] font-semibold uppercase tracking-[0.08em] text-zinc-800">Filters</h3>
                    <button
                        type="button"
                        aria-label="Close filters"
                        onClick={() => setIsMobileFiltersOpen(false)}
                        className="inline-flex size-9 items-center justify-center rounded-full bg-[#E4B037] text-zinc-900 transition-opacity hover:opacity-90"
                    >
                        <X className="size-4" strokeWidth={2} />
                    </button>
                </div>

                <ShopSidebar
                    sizeOptions={sizeOptions}
                    categoryOptions={categoryOptions}
                    selectedAvailability={selectedAvailability}
                    selectedSizes={selectedSizes}
                    selectedCategories={selectedCategories}
                    minPrice={minPrice}
                    maxPrice={maxPrice}
                    highestPrice={highestDbPrice}
                    hideTitle
                    onToggleAvailability={(value) => toggleSelected(setSelectedAvailability, value)}
                    onToggleSize={(value) => toggleSelected(setSelectedSizes, value)}
                    onToggleCategory={(value) => toggleSelected(setSelectedCategories, value)}
                    onMinPriceChange={(value) => {
                        setMinPrice(value);
                        setCurrentPage(1);
                    }}
                    onMaxPriceChange={(value) => {
                        setMaxPrice(value);
                        setCurrentPage(1);
                    }}
                />
            </aside>
        </section>
    );
}
