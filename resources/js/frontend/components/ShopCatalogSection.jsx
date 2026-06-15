import { ChevronLeft, ChevronRight, PackageSearch, SlidersHorizontal } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { featuresFontClass } from '../../utils/typography';
import ShopSidebar from './ShopSidebar.jsx';
import { sectionTypography } from '../utils/sectionTypography';

const productImage = '/uploads/heroes/images/hero1.webp';
const PRODUCTS_PER_PAGE = 12;

function parseSizeList(value) {
    if (Array.isArray(value)) {
        return value.map((item) => String(item || '').trim()).filter(Boolean);
    }

    if (typeof value === 'string') {
        return value
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
    }

    return [];
}

function extractSizes(product) {
    const directSizes = parseSizeList(product?.size);
    if (directSizes.length > 0) {
        return directSizes;
    }

    const variants = Array.isArray(product?.variant_rows) ? product.variant_rows : [];
    return variants
        .map((row) => String(row?.size || '').trim())
        .filter(Boolean);
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

function normalizeProducts(payload) {
    if (!Array.isArray(payload)) {
        return [];
    }

    return payload.map((item, index) => ({
        ...item,
        id: item?.id ?? `product-${index}`,
        name: String(item?.name || '').trim() || 'Untitled Product',
        priceValue: Number(item?.price) || 0,
        price: `$${(Number(item?.price) || 0).toFixed(2)}`,
        cover_image: item?.cover_image || null,
        image_gallery: Array.isArray(item?.image_gallery) ? item.image_gallery : [],
        color: item?.color,
        color_variant_images:
            item?.color_variant_images && typeof item.color_variant_images === 'object'
                ? item.color_variant_images
                : {},
        sizes: extractSizes(item),
        stockValue: getProductStock(item),
        grand_child_id: item?.grand_child_id != null ? String(item.grand_child_id) : '',
        tag: item?.show_on_best_sellers ? 'Best Seller' : null,
    }));
}

function normalizeSizeOptions(payload) {
    if (!Array.isArray(payload)) {
        return [];
    }

    return [
        ...new Set(
            payload
                .flatMap((item) => parseSizeList(item?.size ?? item?.Size ?? item?.name ?? ''))
                .filter(Boolean),
        ),
    ];
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

function normalizeProductColors(value) {
    if (Array.isArray(value)) {
        return value.map((item) => String(item || '').trim()).filter(Boolean);
    }

    if (typeof value === 'string' && value.trim()) {
        return value.split(',').map((item) => item.trim()).filter(Boolean);
    }

    return [];
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

function getSwatchColor(value, colorLookup = {}) {
    if (typeof value !== 'string') {
        return '#d4d4d8';
    }

    const trimmed = value.trim();
    if (/^#[0-9a-f]{6}$/i.test(trimmed)) {
        return trimmed;
    }

    if (/^[a-z]+$/i.test(trimmed)) {
        return trimmed.toLowerCase();
    }

    const mappedColor = colorLookup[trimmed.toLowerCase()];
    if (mappedColor) {
        return mappedColor;
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

function ColorSwatch({ color, active, onClick, colorLookup }) {
    return (
        <button
            type="button"
            title={color}
            onClick={onClick}
            className={`inline-block size-4 rounded-full border shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)] transition-transform hover:scale-110 ${
                active ? 'border-zinc-900 ring-1 ring-zinc-900/25' : 'border-zinc-200'
            }`}
            style={{ backgroundColor: getSwatchColor(color, colorLookup) }}
        />
    );
}

function ProductCard({ product, colorLookup = {} }) {
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

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [selectedColor, setSelectedColor] = useState(() => colors[0] || null);

    useEffect(() => {
        setCurrentImageIndex(0);
        setSelectedColor(colors[0] || null);
    }, [product.id, product.color]);

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

    const productLink = product.slug ? `/shop/${product.slug}` : `/shop?id=${product.id}`;

    return (
        <article className="group overflow-hidden border border-zinc-200 bg-white">
            <Link to={productLink} className="block">
                <div className="relative overflow-hidden bg-zinc-100">
                    <img
                        src={imageSrc}
                        alt={product.name}
                        className="h-[250px] w-full object-cover object-center transition-transform duration-500 group-hover:scale-105 sm:h-[320px]"
                    />

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

                            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-black/30 px-2 py-1">
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
                            </div>
                        </>
                    ) : null}
                </div>
            </Link>

            <div className="space-y-2 p-4">
                {colors.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {colors.slice(0, 6).map((c, i) => (
                            <ColorSwatch
                                key={`${c}-${i}`}
                                color={c}
                                active={selectedColor === c}
                                colorLookup={colorLookup}
                                onClick={(event) => handleSelectColor(c, event)}
                            />
                        ))}
                    </div>
                )}

                <Link to={productLink} className="block">
                    <h3 className={`${sectionTypography.productName} text-zinc-900 line-clamp-2 hover:opacity-70 transition-opacity`}>
                        {product.name}
                    </h3>
                </Link>

                <p className={`${sectionTypography.productPrice} text-zinc-700`}>
                    ${Number(product.priceValue).toFixed(2)}
                </p>
            </div>
        </article>
    );
}

function ShopProductsGrid({
    products = [],
    colorLookup = {},
    currentPage = 1,
    totalPages = 1,
    totalResults = 0,
    onPageChange,
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
                    className="inline-flex items-center gap-2 bg-zinc-950 px-3.5 py-2 text-[0.72rem] font-medium uppercase tracking-[0.14em] text-white"
                >
                    <SlidersHorizontal className="size-4" strokeWidth={1.7} />
                    Sort by
                </button>
            </div>

            {visibleProducts.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {visibleProducts.map((product) => (
                        <ProductCard key={product.id} product={product} colorLookup={colorLookup} />
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
    const location = useLocation();
    const [products, setProducts] = useState([]);
    const [colorLookup, setColorLookup] = useState({});
    const [allCategories, setAllCategories] = useState([]);
    const [allSubCategories, setAllSubCategories] = useState([]);
    const [allGrandChilds, setAllGrandChilds] = useState([]);
    const [sizeOptions, setSizeOptions] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [selectedAvailability, setSelectedAvailability] = useState([]);
    const [selectedSizes, setSelectedSizes] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [minPrice, setMinPrice] = useState('0');
    const [maxPrice, setMaxPrice] = useState('59.99');
    const [highestDbPrice, setHighestDbPrice] = useState('0.00');
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        let ignore = false;

        async function loadShopData() {
            try {
                const [sizesRes, categoriesRes, subCategoriesRes, grandChildsRes, productsRes] = await Promise.all([
                    fetch('/api/public/sizes', { headers: { Accept: 'application/json' } }),
                    fetch('/api/public/categories', { headers: { Accept: 'application/json' } }),
                    fetch('/api/public/sub-categories', { headers: { Accept: 'application/json' } }),
                    fetch('/api/public/grand-childs', { headers: { Accept: 'application/json' } }),
                    fetch('/api/public/shop-products', { headers: { Accept: 'application/json' } }),
                ]);

                const [sizesPayload, categoriesPayload, subCategoriesPayload, grandChildsPayload, productsPayload] = await Promise.all([
                    sizesRes.ok ? sizesRes.json() : [],
                    categoriesRes.ok ? categoriesRes.json() : [],
                    subCategoriesRes.ok ? subCategoriesRes.json() : [],
                    grandChildsRes.ok ? grandChildsRes.json() : [],
                    productsRes.ok ? productsRes.json() : [],
                ]);

                if (ignore) {
                    return;
                }

                const normalizedProducts = normalizeProducts(productsPayload);

                setSizeOptions(normalizeSizeOptions(sizesPayload));
                setAllCategories(Array.isArray(categoriesPayload) ? categoriesPayload : []);
                setAllSubCategories(Array.isArray(subCategoriesPayload) ? subCategoriesPayload : []);
                setAllGrandChilds(Array.isArray(grandChildsPayload) ? grandChildsPayload : []);
                setCategoryOptions(normalizeGrandChildOptions(grandChildsPayload));
                setProducts(normalizedProducts);

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

                const colorsRes = await fetch('/api/public/colors', {
                    headers: { Accept: 'application/json' },
                });

                if (colorsRes.ok) {
                    const colorData = await colorsRes.json();
                    const colorList = Array.isArray(colorData)
                        ? colorData
                        : (Array.isArray(colorData?.data) ? colorData.data : []);

                    setColorLookup(
                        Object.fromEntries(
                            colorList
                                .map(normalizeColorLookupEntry)
                                .filter(Boolean),
                        ),
                    );
                } else {
                    setColorLookup({});
                }
            } catch {
                if (ignore) {
                    return;
                }

                setSizeOptions([]);
                setAllCategories([]);
                setAllSubCategories([]);
                setAllGrandChilds([]);
                setCategoryOptions([]);
                setProducts([]);
                setColorLookup({});
                setMinPrice('0.00');
                setMaxPrice('0.00');
                setHighestDbPrice('0.00');
            }
        }

        loadShopData();

        return () => {
            ignore = true;
        };
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const categoryValue = params.get('category');
        const subCategoryValue = params.get('sub_category');
        const grandChildValue = params.get('grand_child');
        const rawSearch = params.get('search') || params.get('q') || '';
        const sizeValue = params.get('size') || '';

        setSearchTerm(rawSearch.trim());

        if (sizeValue.trim()) {
            const requestedSizes = sizeValue
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean);
            setSelectedSizes(requestedSizes);
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
    }, [location.search, allCategories, allSubCategories, allGrandChilds]);

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
                const matchesSize = product.sizes.some((size) => selectedSizes.includes(String(size)));
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
    }, [products, selectedAvailability, selectedSizes, selectedCategories, minPrice, maxPrice, searchTerm]);

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

    return (
        <section className={`${featuresFontClass} px-5 py-12 sm:px-8 lg:px-12 lg:py-16`}>
            <div className="mx-auto grid w-full max-w-[1709px] gap-8 lg:grid-cols-[360px_1fr] lg:gap-10">
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
                <ShopProductsGrid
                    products={paginatedProducts}
                    colorLookup={colorLookup}
                    currentPage={safeCurrentPage}
                    totalPages={totalPages}
                    totalResults={filteredProducts.length}
                    onPageChange={setCurrentPage}
                />
            </div>
        </section>
    );
}
