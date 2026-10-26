import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { requestJson } from '@/lib/apiClient';

const COVER = '/uploads/catelog/coverPhoto.jpeg';

const PRODUCTS_ENDPOINT = '/api/public/shop-products';
const COLORS_ENDPOINT = '/api/public/colors';
const SIZES_ENDPOINT = '/api/public/sizes';
const CATEGORIES_ENDPOINT = '/api/public/categories';
const SUBCATEGORIES_ENDPOINT = '/api/public/sub-categories';
const GRANDCHILDS_ENDPOINT = '/api/public/grand-childs';

const BRAND_TEXT = '1971CO.';

// Image for the intro page. Point this at your own photo/banner.
const INTRO_IMAGE = '/uploads/catelog/home_image.png';

const BRAND_STATEMENT =
    "At 1971Co. we believe Casualwear is more than just a wardrobe staple it’s an extension of your persona. It's a statement of identity and confidence. Our designs combine bold aesthetics, urban culture influences, and high-quality craftsmanship to help individuals express themselves fearlessly.";

const MISSION_STATEMENT =
    'Our mission is to make personalized fashion accessible, premium, and expressive. We aim to deliver apparel that combines comfort, durability, and modern design while giving customers the freedom to create styles that represent their identity.';

// Category cards are built from the database. These only style them.
const CATEGORY_COLORS = ['#3f6b73', '#b08a5a', '#1f2937', '#7a4e5b', '#4d6b3f', '#5a5f8f'];
const DEFAULT_ICON =
    'M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01';
const MAX_CATEGORY_COLS = 4;

const LINKS = [
    { label: 'Tops', href: '/tops' },
    { label: 'Bottoms', href: '/bottom-more' },
    { label: 'Essentials', href: '/shop?collection=essentials' },
    { label: 'New Arrivals', href: '/new-arrivals' },
];

const FLIP_MS = 1000;
const WHEEL_COOLDOWN_MS = FLIP_MS + 250; // ignores trackpad inertia after a flip
const EASE = 'cubic-bezier(0.45, 0.05, 0.25, 1)';

// Open book size: width / height. Higher = wider pages.
const BOOK_ASPECT = 1.7;
const BOOK_MAX_W = 1800;
const BOOK_V_SPACE = 140; // px reserved above/below the book

// Below this width each spread is shown as one tall page (left half on top, right half below)
const MOBILE_QUERY = '(max-width: 767px)';
const MOBILE_MAX_W = 480;
const SWIPE_PX = 50;

function useIsMobile() {
    const [mobile, setMobile] = useState(() => typeof window !== 'undefined' && window.matchMedia(MOBILE_QUERY).matches);
    useEffect(() => {
        const mq = window.matchMedia(MOBILE_QUERY);
        const onChange = () => setMobile(mq.matches);
        onChange();
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    }, []);
    return mobile;
}

const faceStyle = {
    position: 'absolute',
    inset: 0,
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    overflow: 'hidden',
    background: '#fff',
};

// Makes cqw units inside a page relative to that page's width
const CQ = { containerType: 'inline-size' };

// Montserrat everywhere inside the catalogue (!important beats any global heading font)
const FONT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');
.catalog-font, .catalog-font * { font-family: 'Montserrat', sans-serif !important; }
`;

/* ---------- PDF EXPORT ---------- */

const EXPORT_W = 1700; // px width of one spread in the PDF
const EXPORT_H = Math.round(EXPORT_W / BOOK_ASPECT);
const EXPORT_FILE = '1971co-catalogue.pdf';

// True while the hidden export copy is rendered (turns off lazy image loading)
const ExportCtx = createContext(false);

const waitForImages = async (root) => {
    const imgs = Array.from(root.querySelectorAll('img'));
    await Promise.all(
        imgs.map((img) =>
            img.complete
                ? null
                : new Promise((resolve) => {
                      img.addEventListener('load', resolve, { once: true });
                      img.addEventListener('error', resolve, { once: true });
                      setTimeout(resolve, 8000);
                  }),
        ),
    );
};

function DownloadIcon() {
    return (
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v12m0 0-4-4m4 4 4-4M4 20h16" />
        </svg>
    );
}

/* ---------- DATA ---------- */

// Handles: [..], { data: [..] }, and paginated { data: { data: [..] } }
async function fetchList(url) {
    try {
        const payload = await requestJson(url);
        if (Array.isArray(payload)) return payload;
        if (Array.isArray(payload?.data)) return payload.data;
        if (Array.isArray(payload?.data?.data)) return payload.data.data;
        return [];
    } catch {
        return [];
    }
}

const toArray = (value) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }
    return [];
};

const toObject = (value) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) return value;
    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value);
            return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
        } catch {
            return {};
        }
    }
    return {};
};

const splitIds = (value) =>
    String(value ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

const stripHtml = (value) =>
    String(value ?? '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

const toMap = (rows) =>
    Object.fromEntries(
        rows.map((r) => [
            String(r.id),
            {
                name: r.name || r.size || r.Size || r.title || r.label || '',
                hex: r.hex || r.code || r.color_code || r.value || '',
            },
        ]),
    );

const categoryImage = (category) => {
    const image = category?.image_url || category?.image;
    if (!image || typeof image !== 'string') return '';
    if (/^(https?:|data:|\/)/i.test(image)) return image;
    return `/${image}`;
};

// Returns the first non-empty value among the given keys, as a string
const pickId = (item, keys) => {
    for (const k of keys) {
        const v = item?.[k];
        if (v !== undefined && v !== null && v !== '') return String(v);
    }
    return '';
};

const byPosition = (a, b) => {
    const pa = Number(a?.position);
    const pb = Number(b?.position);
    if (Number.isFinite(pa) && Number.isFinite(pb) && pa !== pb) return pa - pb;
    return Number(a?.id) - Number(b?.id);
};

const subCategoryId = (g) => pickId(g, ['sub_category_id', 'child_id']) || String(g?.sub_category?.id ?? '');
const parentCategoryId = (s) => pickId(s, ['category_id']) || String(s?.category?.id ?? '');

// One card per sub-category in the database, with its grandchilds inside
function buildCategoryHierarchy(categories, subcategories, grandchilds) {
    // Sub-categories that only exist through their grandchilds
    const known = new Set(subcategories.map((s) => String(s.id)));
    const derived = [];
    grandchilds.forEach((g) => {
        const id = subCategoryId(g);
        if (!id || known.has(id)) return;
        known.add(id);
        derived.push({
            id,
            name: g.sub_category?.name || `Sub ${id}`,
            slug: g.sub_category?.slug || id,
            category_id: g.sub_category?.category_id ?? g.category_id,
        });
    });

    // Order by parent category position, then by sub-category position
    const categoryOrder = new Map([...categories].sort(byPosition).map((c, i) => [String(c.id), i]));
    const rank = (s) => categoryOrder.get(parentCategoryId(s)) ?? Number.MAX_SAFE_INTEGER;

    return [...subcategories, ...derived]
        .sort((a, b) => rank(a) - rank(b) || byPosition(a, b))
        .map((subcategory, index) => ({
            key: `subcategory-${subcategory.id}`,
            title: subcategory.name,
            href: `/shop?sub_category=${encodeURIComponent(subcategory.slug || subcategory.id)}`,
            color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
            icon: DEFAULT_ICON,
            image: categoryImage(subcategory),
            grandchilds: grandchilds
                .filter((g) => subCategoryId(g) === String(subcategory.id))
                .sort(byPosition),
        }));
}

// Everything a spread needs, prepared once per product
function buildView(p, colorMap, sizeMap) {
    const variantImages = toObject(p.color_variant_images);
    const isBundle = [p.name, p.sku].some((value) => String(value || '').toLowerCase().includes('bundle'));
    const normalizedProductName = `${p.name || ''} ${p.sku || ''}`.toLowerCase().replace(/[^a-z0-9]/g, '');
    const isTankTopBundle = normalizedProductName.includes('tanktop') && normalizedProductName.includes('bundle');

    const colors = splitIds(p.color).map((id) => {
        const c = colorMap[id];
        const name = c?.name || id;
        const images = toArray(variantImages[id] ?? variantImages[name]);
        return {
            id,
            name,
            hex: c?.hex || '',
            images,
            image: isTankTopBundle
                ? images[2] || images[1] || images[0] || ''
                : (isBundle ? images[1] : images[0]) || images[0] || '',
        };
    });

    const sizeIds = [
        ...new Set([...splitIds(p.size), ...toArray(p.variant_rows).flatMap((r) => splitIds(r?.size))]),
    ];
    const sizes = sizeIds.map((id) => sizeMap[id]?.name).filter(Boolean);

    const features = toArray(p.product_features)
        .map((f) => (typeof f === 'string' ? f : f?.text || f?.title || f?.name || f?.label || ''))
        .filter(Boolean)
        .slice(0, 6);

    // Catalog feature images from the product module; fall back to the product gallery.
    const catalogFeatures = toArray(p.catalog_feature_images).filter(Boolean);
    const tankTopBundleGallery = isTankTopBundle
        ? colors.flatMap((color) => color.images.slice(0, 2))
        : [];
    const gallery = isTankTopBundle
        ? tankTopBundleGallery
        : (catalogFeatures.length ? catalogFeatures : toArray(p.image_gallery)).slice(0, 6);
    if (gallery.length === 0 && p.cover_image) gallery.push(p.cover_image);

    return {
        product: p,
        image: p.catalog_thumb_image || p.cover_image || gallery[0] || '',
   
        composition: stripHtml(p.product_composition) || stripHtml(p.fabric_and_care),
        features,
        sizes,
        colors,
        gallery,
        isTankTopBundle,
        // Swatch fabric photo. Empty = the placeholder box is shown.
        swatch: p.catalog_swatch_image || p.swatch_fabric_image || p.swatch_image || '',
    };
}

const PRODUCT_CATEGORY_ORDER = [
    ['tshirt', 'tshirts'],
    ['polo'],
    ['hoodie', 'sweatshirt'],
    ['sweatjacket'],
    ['vest'],
    ['jogger'],
    ['undershirtbundle', 'undershirtsbundle'],
    ['shortsbundle'],
    ['tanktopbundle', 'tanktopsbundle'],
];

function orderCatalogProducts(products, subcategories, grandchilds) {
    const subcategoryById = new Map(subcategories.map((subcategory) => [String(subcategory.id), subcategory]));
    const grandchildById = new Map(grandchilds.map((grandchild) => [String(grandchild.id), grandchild]));

    const getProductOrder = (product) => {
        const grandchild = grandchildById.get(String(product.grand_child_id ?? ''));
        const subcategoryId = product.subcategory_id
            ?? product.sub_category_id
            ?? grandchild?.sub_category_id
            ?? grandchild?.child_id;
        const subcategory = subcategoryById.get(String(subcategoryId ?? '')) ?? grandchild?.sub_category;
        const text = [
            product.name,
            product.sku,
            grandchild?.name,
            grandchild?.slug,
            subcategory?.name,
            subcategory?.slug,
        ]
            .join(' ')
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '');

        return PRODUCT_CATEGORY_ORDER.findIndex((terms) => terms.some((term) => text.includes(term)));
    };

    return products
        .map((product, index) => ({ product, index, order: getProductOrder(product) }))
        .sort((a, b) => {
            const orderA = a.order === -1 ? PRODUCT_CATEGORY_ORDER.length : a.order;
            const orderB = b.order === -1 ? PRODUCT_CATEGORY_ORDER.length : b.order;
            return orderA - orderB || a.index - b.index;
        })
        .map(({ product }) => product);
}

// Index 0 = closed book (cover on the right). Then the intro spread,
// then one spread per product, cycling through the layouts (A, B, C, A, B, C ...).
function buildPages(products, colorMap, sizeMap, categories, subcategories, grandchilds) {
    const orderedProducts = orderCatalogProducts(products, subcategories, grandchilds);

    return [
        { src: COVER, single: true },
        {
            intro: true,
            categories: buildCategoryHierarchy(categories, subcategories, grandchilds),
        },
        ...orderedProducts.map((p, i) => {
            const view = buildView(p, colorMap, sizeMap);
            return { ...view, layout: view.isTankTopBundle ? 0 : i % LAYOUTS.length };
        }),
    ];
}

/* ---------- SHARED PIECES ---------- */

function Chevron({ dir }) {
    return (
        <svg viewBox="0 0 24 24" className="size-9" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d={dir === 'right' ? 'M9 5l7 7-7 7' : 'M15 5l-7 7 7 7'} />
        </svg>
    );
}

function CheckIcon({ className = 'size-[2.6cqw]' }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
    );
}

// Never crops: the whole image is always visible inside a fixed-size frame.
// blur = fills any empty edges with a blurred copy (use on the big photos).
function Photo({ src, alt = '', blur = false, className = '' }) {
    const exporting = useContext(ExportCtx);

    return (
        <div className={`relative size-full min-h-0 min-w-0 overflow-hidden bg-[#e6e8e8] ${className}`}>
            {blur && (
                <img
                    src={src}
                    alt=""
                    aria-hidden="true"
                    draggable={false}
                    className="absolute inset-0 size-full scale-125 object-cover opacity-70 blur-2xl"
                />
            )}
            <img
                src={src}
                alt={alt}
                loading={blur || exporting ? undefined : 'lazy'}
                draggable={false}
                className="relative size-full object-contain"
            />
        </div>
    );
}

function Section({ title, children }) {
    return (
        <div className="border-b border-zinc-300 pb-[2cqw]">
            <p className="text-[1.7cqw] font-semibold uppercase tracking-[0.1em] text-zinc-500">{title}</p>
            <div className="mt-[1cqw]">{children}</div>
        </div>
    );
}

const WHOLESALE_EMAIL = 'wholesale@1971co.com';

function SizeChips({ sizes }) {
    return (
        <div className="flex flex-wrap gap-[1cqw]">
            {sizes.map((s) => (
                <span
                    key={s}
                    className="flex min-w-[5cqw] items-center justify-center border border-zinc-400 px-[1cqw] py-[0.6cqw] text-[1.9cqw] text-zinc-700"
                >
                    {s}
                </span>
            ))}
        </div>
    );
}

// Shown on every product info page, independent of sizes
function WholesaleNote({ className = '' }) {
    return (
        <p className={`text-[1.9cqw] leading-snug text-zinc-600 ${className}`}>
            For Wholesale Price please email us on{' '}
            <a
                href={`mailto:${WHOLESALE_EMAIL}`}
                onClick={(e) => e.stopPropagation()} // don't flip the page when clicking the email
                className="font-semibold text-black underline underline-offset-2 transition-colors hover:text-zinc-600 focus:outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
            >
                {WHOLESALE_EMAIL}
            </a>
        </p>
    );
}

function GalleryGrid({ images, cols, rows, fitContent = false, aspectRatio = '3 / 4' }) {
    return (
        <div
            className={`grid min-h-0 min-w-0 gap-[1.2cqw] ${fitContent ? 'shrink-0' : 'flex-1'}`}
            style={{
                gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                ...(fitContent ? {} : { gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))` }),
            }}
        >
            {images.slice(0, cols * rows).map((src, i) => (
                <div
                    key={`${src}-${i}`}
                    className="min-h-0 min-w-0"
                    style={fitContent ? { aspectRatio } : undefined}
                >
                    <Photo src={src} />
                </div>
            ))}
        </div>
    );
}

// "Swatch Fabric" label on the left, square slot for the fabric photo on the right.
// Shows an empty dashed box until a swatch image exists.
function SwatchFabric({ image, className = '' }) {
    return (
        <div
            className={`flex shrink-0 items-center justify-between gap-[2cqw] border border-zinc-300 bg-white/60 px-[2cqw] py-[1.5cqw] ${className}`}
        >
            <p className="text-[1.7cqw] font-semibold uppercase tracking-[0.1em] text-zinc-500">Swatch Fabric</p>
            <div className="size-[9cqw] shrink-0 overflow-hidden border border-dashed border-zinc-400 bg-zinc-100">
                {image && <Photo src={image} alt="Swatch fabric" />}
            </div>
        </div>
    );
}

// Colour cards: image on top, name below
function ColorCards({ colors }) {
    return (
        <div className="grid min-h-0 flex-1 grid-cols-4 gap-[2cqw]">
            {colors.slice(0, 4).map((c, i) => (
                <div key={c.id} className="flex min-h-0 flex-col items-center">
                    <div
                        className={`min-h-0 w-full flex-1 overflow-hidden bg-zinc-200 ${i === 0 ? 'ring-1 ring-zinc-500' : ''}`}
                        style={!c.image && c.hex ? { backgroundColor: c.hex } : undefined}
                    >
                        {c.image && <Photo src={c.image} alt={c.name} />}
                    </div>
                    <p className="mt-[1cqw] truncate text-[1.8cqw] text-zinc-600">{c.name}</p>
                </div>
            ))}
        </div>
    );
}

// Colour row: small thumb with the name beside it
function ColorRow({ colors }) {
    return (
        <div className="grid grid-cols-2 gap-[1.5cqw]">
            {colors.slice(0, 4).map((c, i) => (
                <div key={c.id} className={`flex min-w-0 items-center gap-[1.5cqw] p-[0.6cqw] ${i === 0 ? 'border border-zinc-400' : ''}`}>
                    <div
                        className="h-[8cqw] w-[6cqw] shrink-0 overflow-hidden bg-zinc-200"
                        style={!c.image && c.hex ? { backgroundColor: c.hex } : undefined}
                    >
                        {c.image && <Photo src={c.image} alt={c.name} />}
                    </div>
                    <span className="truncate text-[1.8cqw] uppercase tracking-wider text-zinc-600">{c.name}</span>
                </div>
            ))}
        </div>
    );
}

// Vertical "1971CO." strip on the outer edge of every page that shows a photo
// (left edge on left-hand pages, right edge on right-hand pages)
function BrandStrip({ side = 'left' }) {
    return (
        <div
            className={`pointer-events-none absolute bottom-[10%] top-[34%] z-10 flex w-[6%] items-center justify-center ${side === 'right' ? 'right-[1.5%]' : 'left-[1.5%]'}`}
            aria-hidden="true"
        >
            <span
                className="whitespace-nowrap text-[3.4cqw] font-black tracking-[0.5em] text-zinc-800"
                style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', textShadow: '0 0 0.8cqw rgba(255,255,255,0.7)' }}
            >
                {BRAND_TEXT}
            </span>
        </div>
    );
}

/* ---------- LAYOUT A: hero left / details right ---------- */

function HeroPage({ view }) {
    const { product, image } = view;

    return (
        <div className="relative flex size-full flex-col overflow-hidden" style={{ ...CQ, background: 'linear-gradient(135deg, #f5f5f4 0%, #d9d9dc 100%)' }}>
            {image && (
                <div className="relative mb-[5.3cqw] mt-[3cqw] min-h-0 flex-1" style={{ marginLeft: '9%', width: '85%' }}>
                    <Photo src={image} alt={product.name} blur />
                </div>
            )}
        </div>
    );
}

function DetailsPage({ view }) {
    const { product, composition, sizes, colors, gallery, features, swatch, isTankTopBundle } = view;

    return (
        <div className="size-full bg-[#f6f6f4]" style={CQ}>
            <div className="flex size-full flex-col pb-[4cqw] pl-[5cqw] pr-[3cqw] pt-[3cqw]">
                <h2 className="mb-[2cqw] shrink-0 line-clamp-2 text-[3.5cqw] font-extrabold uppercase leading-tight tracking-tight text-zinc-900">
                    {product.name}
                </h2>
                <div className="flex min-h-0 flex-[3] gap-[3cqw]">
                    <div className="flex w-[38%] min-w-0 flex-col gap-[2cqw] overflow-hidden">
                        {product.sku && (
                            <Section title="Style">
                                <p className="truncate text-[1.9cqw] text-zinc-600">{product.sku}</p>
                            </Section>
                        )}

                        {sizes.length > 0 && (
                            <Section title="Size Variant">
                                <SizeChips sizes={sizes} />
                            </Section>
                        )}

                        {features.length > 0 && (
                            <Section title="Product Features">
                                {features.slice(0, 4).map((f) => (
                                    <p key={f} className="line-clamp-4 text-[1.9cqw] leading-snug text-zinc-600">
                                        {f}
                                    </p>
                                ))}
                            </Section>
                        )}

                        {composition && (
                            <Section title="Product Composition">
                                <p className="line-clamp-4 text-[1.9cqw] leading-snug text-zinc-600">{composition}</p>
                            </Section>
                        )}

                        <WholesaleNote />
                    </div>

                    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-[1.5cqw]">
                        <GalleryGrid
                            images={gallery}
                            cols={2}
                            rows={isTankTopBundle ? 4 : 3}
                            fitContent={!isTankTopBundle}
                            aspectRatio="4 / 3"
                        />
                        <SwatchFabric image={swatch} />
                    </div>
                </div>

                {colors.length > 0 && (
                    <div className="mt-[3cqw] flex min-h-0 flex-[1] flex-col">
                        <ColorCards colors={colors} />
                    </div>
                )}
            </div>
        </div>
    );
}

/* ---------- LAYOUT B: full-bleed photo left / editorial right ---------- */

function PhotoPage({ view }) {
    const { product, image, colors } = view;

    return (
        <div className="relative size-full overflow-hidden bg-zinc-200" style={CQ}>
            {image && <Photo src={image} alt={product.name} blur />}
            <BrandStrip />
            {colors[0] && (
                <span className="absolute bottom-[3cqw] left-[3cqw] bg-[#3f6b73]/90 px-[2cqw] py-[1cqw] text-[1.8cqw] uppercase tracking-[0.1em] text-white">
                    {colors[0].name}
                </span>
            )}
        </div>
    );
}

function EditorialPage({ view }) {
    const { product,  features, composition, sizes, colors, gallery, swatch } = view;

    return (
        <div className="size-full bg-[#f1ede4]" style={CQ}>
            <div className="flex size-full flex-col px-[4.5cqw] pb-[4cqw] pt-[3.5cqw]">
                {/* Brand only; the style number moved into the info column */}
                <div className="text-[1.7cqw] uppercase tracking-[0.1em] text-zinc-500">
                    <span>{BRAND_TEXT}</span>
                </div>

                {/* 1. Product name */}
                <h2 className="mt-[1.5cqw] line-clamp-2 text-[5cqw] font-extrabold uppercase leading-[1.08] tracking-tight text-zinc-900">
                    {product.name}
                </h2>

               
                <div className="mt-[2.5cqw] flex min-h-0 flex-[3] gap-[2.5cqw] border-t border-zinc-300 pt-[2cqw]">
                    <div className="flex w-[42%] min-w-0 flex-col gap-[1.5cqw] overflow-hidden">
                        {/* 3. Style number */}
                        {product.sku && (
                            <Section title="Style Number">
                                <p className="truncate text-[1.9cqw] text-zinc-600">{product.sku}</p>
                            </Section>
                        )}

                        {/* 4. Size variant */}
                        {sizes.length > 0 && (
                            <Section title="Size Variant">
                                <SizeChips sizes={sizes} />
                            </Section>
                        )}

                        {/* 5. Features */}
                        {features.length > 0 && (
                            <Section title="Features">
                                <ul className="flex flex-col gap-[0.8cqw]">
                                    {features.slice(0, 6).map((f) => (
                                        <li key={f} className="flex min-w-0 items-center gap-[1cqw] text-[1.8cqw] text-zinc-700">
                                            <CheckIcon className="size-[2.4cqw] shrink-0" />
                                            <span className="truncate">{f}</span>
                                        </li>
                                    ))}
                                </ul>
                            </Section>
                        )}

                        {/* 6. Composition */}
                        {composition && (
                            <Section title="Product Composition">
                                <p className="line-clamp-3 text-[1.9cqw] leading-snug text-zinc-600">{composition}</p>
                            </Section>
                        )}

                    </div>

                    <div className="flex min-h-0 flex-1 flex-col gap-[1.5cqw]">
                        <GalleryGrid images={gallery} cols={3} rows={2} fitContent />
                        <SwatchFabric image={swatch} className="mt-auto" />
                    </div>
                </div>

                <WholesaleNote className="mt-[1.5cqw] !text-[1.9cqw]" />

                {colors.length > 0 && (
                    <div className="mt-[2.5cqw]">
                        <p className="mb-[1cqw] text-[1.7cqw] font-semibold uppercase tracking-[0.1em] text-zinc-500">Colors</p>
                        <ColorRow colors={colors} />
                    </div>
                )}
            </div>
        </div>
    );
}

/* ---------- LAYOUT C: info left / showcase right ---------- */

function InfoPage({ view }) {
    const { product, features, composition, sizes, colors, swatch } = view;

    return (
        <div className="size-full bg-[#fafaf8]" style={CQ}>
            <div className="flex size-full flex-col px-[5cqw] pb-[4cqw] pt-[5cqw]">
                {/* Brand only; the style number moved into its own section */}
                <div className="text-[1.7cqw] uppercase tracking-[0.1em] text-zinc-500">
                    <span>{BRAND_TEXT}</span>
                </div>

                {/* 1. Product name */}
                <h2 className="mt-[2cqw] line-clamp-3 text-[5.5cqw] font-extrabold uppercase leading-[1.08] tracking-tight text-zinc-900">
                    {product.name}
                </h2>

                

                <div className="mt-[2.5cqw] flex flex-col gap-[1.8cqw] border-t border-zinc-300 pt-[2cqw]">
                    {/* 3. Style number */}
                    {product.sku && (
                        <Section title="Style Number">
                            <p className="truncate text-[1.9cqw] text-zinc-600">{product.sku}</p>
                        </Section>
                    )}

                    {/* 4. Size variant */}
                    {sizes.length > 0 && (
                        <Section title="Size Variant">
                            <SizeChips sizes={sizes} />
                        </Section>
                    )}

                    {/* 5. Features */}
                    {features.length > 0 && (
                        <Section title="Features">
                            <ul className="grid grid-cols-2 gap-x-[2cqw] gap-y-[1cqw]">
                                {features.slice(0, 6).map((f) => (
                                    <li key={f} className="flex min-w-0 items-center gap-[1cqw] text-[1.8cqw] text-zinc-700">
                                        <CheckIcon className="size-[2.6cqw] shrink-0" />
                                        <span className="truncate">{f}</span>
                                    </li>
                                ))}
                            </ul>
                        </Section>
                    )}

                    {/* 6. Composition */}
                    {composition && (
                        <Section title="Product Composition">
                            <p className="line-clamp-3 text-[1.9cqw] leading-snug text-zinc-600">{composition}</p>
                        </Section>
                    )}
                </div>

                <SwatchFabric image={swatch} className="mt-[2cqw]" />
                <WholesaleNote className="mt-[2.5cqw]" />

                <div className="mt-auto">
                    {colors.length > 0 && (
                        <>
                            <p className="mb-[1cqw] text-[1.7cqw] font-semibold uppercase tracking-[0.1em] text-zinc-500">Colors</p>
                            <ColorRow colors={colors} />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function ShowcasePage({ view }) {
    const { product, image, gallery } = view;
    const strip = gallery.filter((src) => src !== image).slice(0, 4);

    return (
        <div className="relative size-full bg-[#ecebe7]" style={CQ}>
            <div className="flex size-full flex-col gap-[1.5cqw] p-[2.5cqw]">
                <div className="min-h-0 flex-[4]">
                    {image && <Photo src={image} alt={product.name} blur />}
                </div>
                {strip.length > 0 && (
                    <div className="grid min-h-0 flex-[1.3] grid-cols-4 gap-[1.5cqw]">
                        {strip.map((src, i) => (
                            <Photo key={`${src}-${i}`} src={src} />
                        ))}
                    </div>
                )}
            </div>
            {image && <BrandStrip side="right" />}
        </div>
    );
}

/* ---------- INTRO SPREAD: brand left / mission + categories right ---------- */

function IntroLeftPage() {
    return (
        <div className="relative flex size-full flex-col bg-[#f1ede4]" style={CQ}>
            <div className="relative min-h-0 flex-[1.3]">
                <Photo src={INTRO_IMAGE} alt="1971Co." blur />
                <BrandStrip side="left" />
            </div>

            <div className="flex flex-1 flex-col justify-center px-[6cqw] py-[4cqw]">
                <p className="text-[1.8cqw] font-semibold uppercase tracking-[0.1em] text-zinc-500">About {BRAND_TEXT}</p>
                <p className="mt-[1.5cqw] text-[2.5cqw] font-medium leading-relaxed text-zinc-800">{BRAND_STATEMENT}</p>
            </div>
        </div>
    );
}

function CategoryCard({ category }) {
    const { title, href, color, grandchilds, icon, image } = category;

    return (
        <div className="group flex min-h-0 min-w-0 flex-col overflow-hidden border border-zinc-300 bg-white transition-shadow hover:shadow-lg">
            <a
                href={href}
                onClick={(e) => e.stopPropagation()}
                className="flex flex-[1.4] flex-col items-center justify-center gap-[1cqw] px-[1cqw] py-[2cqw] text-center text-white"
                style={{ backgroundColor: color }}
            >
                {image ? (
                    <img src={image} alt="" aria-hidden="true" className="size-[7cqw] object-contain" />
                ) : (
                    <svg viewBox="0 0 24 24" className="size-[7cqw]" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d={icon} />
                    </svg>
                )}
                <span className="text-[2.3cqw] font-extrabold uppercase leading-tight tracking-[0.05em]">{title}</span>
            </a>

            <div className="flex min-h-0 flex-[3.6] flex-col px-[2cqw] py-[1.5cqw]">
                <ul className="flex min-h-0 flex-col gap-[0.8cqw] overflow-hidden">
                    {grandchilds.map((grandchild) => (
                        <li key={grandchild.id} className="text-[1.6cqw] font-medium uppercase leading-snug text-zinc-700">
                            <a
                                href={`/shop?grand_child=${encodeURIComponent(grandchild.slug || grandchild.id)}`}
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-start gap-[1cqw] hover:underline"
                            >
                                <span className="mt-[0.6cqw] size-[1cqw] shrink-0" style={{ backgroundColor: color }} />
                                <span>{grandchild.name}</span>
                            </a>
                        </li>
                    ))}
                </ul>
                <a
                    href={href}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-auto pt-[1.5cqw] text-[1.6cqw] font-semibold uppercase tracking-[0.1em]"
                    style={{ color }}
                >
                    Explore →
                </a>
            </div>
        </div>
    );
}

function IntroRightPage({ categories }) {
    const cols = Math.min(Math.max(categories.length, 1), MAX_CATEGORY_COLS);

    return (
        <div className="size-full bg-[#fafaf8]" style={CQ}>
            <div className="flex size-full flex-col px-[5cqw] pb-[4cqw] pt-[5cqw]">
                <p className="text-[1.8cqw] font-semibold uppercase tracking-[0.1em] text-zinc-500">{BRAND_TEXT}</p>
                <h2 className="mt-[1cqw] text-[4.5cqw] font-extrabold uppercase leading-[1.08] tracking-tight text-zinc-900">Our Mission</h2>
                <p className="mt-[1.5cqw] text-[2cqw] leading-relaxed text-zinc-600">{MISSION_STATEMENT}</p>

                <p className="mb-[1.2cqw] mt-[2.5cqw] border-t border-zinc-300 pt-[2cqw] text-[1.8cqw] font-semibold uppercase tracking-[0.1em] text-zinc-500">
                    Shop by category
                </p>

                <div
                    className="grid min-h-0 flex-1 auto-rows-fr gap-[2cqw]"
                    style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
                >
                    {categories.map((category) => (
                        <CategoryCard key={category.key} category={category} />
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ---------- LAYOUT REGISTRY ---------- */

const LAYOUTS = [
    { left: HeroPage, right: DetailsPage }, // A
    { left: PhotoPage, right: EditorialPage }, // B
    { left: InfoPage, right: ShowcasePage }, // C
];

// One half of a spread (or the single cover page)
function Half({ page, side }) {
    if (!page) return null;
    if (page.single) {
        if (side === 'left') return null;
        return <Photo src={page.src} alt="1971Co. catalogue cover" blur />;
    }
    if (page.intro) return side === 'left' ? <IntroLeftPage /> : <IntroRightPage categories={page.categories} />;
    const Page = LAYOUTS[page.layout]?.[side];
    return Page ? <Page view={page} /> : null;
}

// Mobile: one spread as a single tall page, left half on top, right half below
function MobileSpread({ page }) {
    return (
        <div className="flex size-full flex-col bg-white">
            <div className="relative min-h-0 flex-1 overflow-hidden border-b border-zinc-200">
                <Half page={page} side="left" />
            </div>
            <div className="relative min-h-0 flex-1 overflow-hidden">
                <Half page={page} side="right" />
            </div>
        </div>
    );
}

/* ---------- MAIN ---------- */

export default function Catelog() {
    const [stage, setStage] = useState('cover'); // cover | book
    const [page, setPage] = useState(0);
    const [flip, setFlip] = useState(null); // { dir: 'next' | 'prev', go: boolean }
    const [products, setProducts] = useState([]);
    const [colorMap, setColorMap] = useState({});
    const [sizeMap, setSizeMap] = useState({});
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [grandchilds, setGrandchilds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [exportStatus, setExportStatus] = useState('');

    const pages = useMemo(
        () => buildPages(products, colorMap, sizeMap, categories, subcategories, grandchilds),
        [products, colorMap, sizeMap, categories, subcategories, grandchilds],
    );
    const last = pages.length - 1;

    // Mobile skips the cover spread and starts on the intro
    const isMobile = useIsMobile();
    const first = isMobile ? 1 : 0;
    const touchStart = useRef(null);

    const timers = useRef([]);
    const pageRef = useRef(0);
    const pagesRef = useRef(pages);
    pagesRef.current = pages;
    const busy = useRef(false);
    const lastWheel = useRef(0);
    const sectionRef = useRef(null);
    const exportRef = useRef(null);

    const after = (ms, fn) => timers.current.push(setTimeout(fn, ms));
    const clearTimers = () => {
        timers.current.forEach(clearTimeout);
        timers.current = [];
    };
    useEffect(() => clearTimers, []);

    // Load products + colour/size names + categories
    useEffect(() => {
        let ignore = false;
        Promise.all([
            fetchList(PRODUCTS_ENDPOINT),
            fetchList(COLORS_ENDPOINT),
            fetchList(SIZES_ENDPOINT),
            fetchList(CATEGORIES_ENDPOINT),
            fetchList(SUBCATEGORIES_ENDPOINT),
            fetchList(GRANDCHILDS_ENDPOINT),
        ])
            .then(([prods, colors, sizes, categoryList, subcategoryList, grandchildList]) => {
                if (ignore) return;
                setProducts(prods);
                setColorMap(toMap(colors));
                setSizeMap(toMap(sizes));
                setCategories(categoryList);
                setSubcategories(subcategoryList);
                setGrandchilds(grandchildList);
            })
            .finally(() => {
                if (!ignore) setLoading(false);
            });
        return () => {
            ignore = true;
        };
    }, []);

    // Build + download the PDF. Runs after the hidden export copy has rendered.
    useEffect(() => {
        if (!exporting) return undefined;
        let cancelled = false;

        (async () => {
            try {
                const [{ getFontEmbedCSS, toJpeg }, { jsPDF }] = await Promise.all([
                    import('html-to-image'),
                    import('jspdf'),
                ]);

                await document.fonts?.ready;
                await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

                const nodes = Array.from(exportRef.current?.children || []);
                if (nodes.length === 0) return;

                const fontEmbedCSS = await getFontEmbedCSS(nodes[1] || nodes[0]).catch(() => '');
                let pdf = null;

                for (let i = 0; i < nodes.length; i += 1) {
                    if (cancelled) return;
                    setExportStatus(`${i + 1}/${nodes.length}`);

                    const node = nodes[i];
                    await waitForImages(node);

                    const w = node.offsetWidth;
                    const h = node.offsetHeight;
                    const image = await toJpeg(node, {
                        quality: 0.9,
                        pixelRatio: 1.5, // lower (e.g. 1) for a smaller file
                        backgroundColor: '#ffffff',
                        fontEmbedCSS,
                    });

                    const orientation = w > h ? 'landscape' : 'portrait';
                    if (!pdf) {
                        pdf = new jsPDF({ orientation, unit: 'pt', format: [w, h], compress: true });
                    } else {
                        pdf.addPage([w, h], orientation);
                    }
                    pdf.addImage(image, 'JPEG', 0, 0, w, h);
                }

                if (!cancelled && pdf) pdf.save(EXPORT_FILE);
            } catch (error) {
                console.error('Catalogue PDF export failed', error);
                window.alert('Could not create the PDF. Please try again.');
            } finally {
                if (!cancelled) {
                    setExporting(false);
                    setExportStatus('');
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [exporting]);

    const setP = (n) => {
        pageRef.current = n;
        setPage(n);
    };

    const turn = (dir) => {
        const p = pageRef.current;
        const lastIndex = pagesRef.current.length - 1;
        if (busy.current) return;
        if (dir === 'next' && p >= lastIndex) return;
        if (dir === 'prev' && p <= first) return;
        busy.current = true;
        setFlip({ dir, go: false });
        after(30, () => setFlip({ dir, go: true }));
        after(FLIP_MS + 60, () => {
            setP(p + (dir === 'next' ? 1 : -1));
            setFlip(null);
            busy.current = false;
        });
    };

    const enter = () => {
        if (stage !== 'cover' || loading) return;
        setP(first);
        setStage('book');
        if (!isMobile) after(400, () => turn('next')); // open the cover
    };

    const close = () => {
        clearTimers();
        busy.current = false;
        setFlip(null);
        setP(0);
        setStage('cover');
    };

    // Click right half = next, left half = previous
    const onBookClick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        turn(e.clientX - rect.left > rect.width / 2 ? 'next' : 'prev');
    };

    // Mobile swipe: left = next, right = previous (vertical drags still scroll the page)
    const onTouchStart = (e) => {
        const t = e.touches[0];
        touchStart.current = { x: t.clientX, y: t.clientY };
    };
    const onTouchEnd = (e) => {
        const start = touchStart.current;
        touchStart.current = null;
        if (!start) return;
        const t = e.changedTouches[0];
        const dx = t.clientX - start.x;
        const dy = t.clientY - start.y;
        if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(dy)) turn(dx < 0 ? 'next' : 'prev');
    };

    // Keyboard
    useEffect(() => {
        if (stage !== 'book') return;
        const onKey = (e) => {
            if (e.key === 'ArrowRight') turn('next');
            if (e.key === 'ArrowLeft') turn('prev');
            if (e.key === 'Escape') close();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [stage, isMobile]);

    // Mouse wheel / trackpad scroll (desktop book only; mobile scrolls the site normally)
    useEffect(() => {
        if (stage !== 'book' || isMobile) return;
        const el = sectionRef.current;
        if (!el) return;

        const onWheel = (e) => {
            if (Math.abs(e.deltaY) < 4) return;
            const dir = e.deltaY > 0 ? 'next' : 'prev';
            const p = pageRef.current;
            const lastIndex = pagesRef.current.length - 1;

            // At the first/last page let the browser scroll the site normally
            if ((dir === 'next' && p >= lastIndex) || (dir === 'prev' && p <= 0)) return;

            e.preventDefault();

            const now = performance.now();
            if (busy.current || now - lastWheel.current < WHEEL_COOLDOWN_MS) return;
            lastWheel.current = now;
            turn(dir);
        };

        el.addEventListener('wheel', onWheel, { passive: false });
        return () => el.removeEventListener('wheel', onWheel);
    }, [stage, isMobile]);

    const leftPage = flip?.dir === 'prev' ? pages[page - 1] : pages[page];
    const rightPage = flip?.dir === 'next' ? pages[page + 1] : pages[page];
    const closed = page === 0 && !(flip?.dir === 'next' && flip.go);

    const flipStyle = flip && {
        position: 'absolute',
        top: 0,
        width: '50%',
        height: '100%',
        zIndex: 5,
        transformStyle: 'preserve-3d',
        transition: `transform ${FLIP_MS}ms ${EASE}`,
        ...(flip.dir === 'next'
            ? { right: 0, transformOrigin: 'left center', transform: flip.go ? 'rotateY(-180deg)' : 'rotateY(0deg)' }
            : { left: 0, transformOrigin: 'right center', transform: flip.go ? 'rotateY(180deg)' : 'rotateY(0deg)' }),
    };

    // Mobile: the whole stacked page turns around its left edge.
    // next = current page swings away; prev = previous page swings back in.
    const mobileUnder = flip?.dir === 'next' ? pages[page + 1] : pages[page];
    const mobileTurning = flip?.dir === 'next' ? pages[page] : pages[page - 1];
    const mobileFlipStyle = flip && {
        position: 'absolute',
        inset: 0,
        zIndex: 5,
        transformStyle: 'preserve-3d',
        transformOrigin: 'left center',
        transition: `transform ${FLIP_MS}ms ${EASE}`,
        transform: (flip.dir === 'next') === flip.go ? 'rotateY(-180deg)' : 'rotateY(0deg)',
    };

    return (
        <section
            ref={sectionRef}
            className="catalog-font relative flex min-h-[calc(100vh-90px)] items-center justify-center overflow-hidden bg-[#333] px-4 py-16 md:px-20 md:py-8"
        >
            <style>{FONT_CSS}</style>

            {/* Download button (visible on the cover and inside the book) */}
            <button
                type="button"
                onClick={() => setExporting(true)}
                disabled={loading || exporting}
                className="absolute left-4 top-4 z-20 flex cursor-pointer items-center gap-2 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wider text-black shadow transition-colors hover:bg-zinc-200 disabled:cursor-wait disabled:opacity-60"
            >
                <DownloadIcon />
                {exporting ? `Preparing PDF ${exportStatus}` : 'Download PDF'}
            </button>

            {/* Hidden full-size copy of every page, used only to build the PDF */}
            {exporting && (
                <div
                    ref={exportRef}
                    aria-hidden="true"
                    className="catalog-font pointer-events-none fixed left-0 top-0 -z-10 opacity-0"
                >
                    <ExportCtx.Provider value>
                        {pages.map((p, i) =>
                            p.single ? (
                                <div key={i} style={{ width: EXPORT_W / 2, height: EXPORT_H }}>
                                    <Half page={p} side="right" />
                                </div>
                            ) : (
                                <div key={i} className="flex" style={{ width: EXPORT_W, height: EXPORT_H }}>
                                    <div className="relative h-full w-1/2 overflow-hidden bg-white">
                                        <Half page={p} side="left" />
                                    </div>
                                    <div className="relative h-full w-1/2 overflow-hidden bg-white">
                                        <Half page={p} side="right" />
                                    </div>
                                </div>
                            ),
                        )}
                    </ExportCtx.Provider>
                </div>
            )}

            {/* ---------- COVER ---------- */}
            {stage === 'cover' && (
                <div className="w-full max-w-[406px] bg-gradient-to-b from-white to-zinc-400 p-[18px] shadow-2xl">
                    <div className="relative aspect-[372/445] overflow-hidden rounded-bl-[56px] rounded-br-sm rounded-tl-sm rounded-tr-[56px] bg-slate-700">
                        <Photo src={COVER} alt="1971Co. catalogue cover" blur />

                        <button
                            type="button"
                            onClick={enter}
                            disabled={loading}
                            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer bg-black px-2.5 py-1.5 text-base font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-wait disabled:opacity-60"
                        >
                            {loading ? 'Loading...' : 'Read Now'}
                        </button>
                    </div>

                    <nav aria-label="Catalog categories" className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-white">
                        {LINKS.map((l, i) => (
                            <span key={l.label} className="flex items-center gap-3">
                                {i > 0 && <span aria-hidden="true">|</span>}
                                <a href={l.href} className="transition-opacity hover:opacity-70">{l.label}</a>
                            </span>
                        ))}
                    </nav>
                </div>
            )}

            {/* ---------- MOBILE: SPREAD STACKED AS ONE PAGE, WITH PAGE FLIP ---------- */}
            {stage === 'book' && isMobile && (
                <>
                    <button
                        type="button"
                        onClick={close}
                        aria-label="Close catalog"
                        className="absolute right-5 top-4 z-20 cursor-pointer text-3xl leading-none text-white transition-opacity hover:opacity-70"
                    >
                        ×
                    </button>

                    <div className="flex w-full flex-col items-center gap-4">
                        <div
                            onClick={onBookClick}
                            onTouchStart={onTouchStart}
                            onTouchEnd={onTouchEnd}
                            className="relative w-full cursor-pointer select-none"
                            style={{
                                maxWidth: MOBILE_MAX_W,
                                aspectRatio: BOOK_ASPECT / 4, // two pages stacked
                                perspective: '2000px',
                                filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.5))',
                            }}
                        >
                            <div className="absolute inset-0 z-[1]">
                                <MobileSpread page={mobileUnder} />
                            </div>

                            {flip && (
                                <div style={mobileFlipStyle}>
                                    <div style={faceStyle}><MobileSpread page={mobileTurning} /></div>
                                    <div style={{ ...faceStyle, transform: 'rotateY(180deg)', background: '#e9e9e6' }} />
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-6 text-white">
                            <button
                                type="button"
                                onClick={() => turn('prev')}
                                disabled={page <= first}
                                aria-label="Previous page"
                                className="cursor-pointer transition-opacity hover:opacity-70 disabled:cursor-default disabled:opacity-30"
                            >
                                <Chevron dir="left" />
                            </button>
                            <span className="min-w-[4rem] text-center text-xs text-white/70">
                                {page} / {last}
                            </span>
                            <button
                                type="button"
                                onClick={() => turn('next')}
                                disabled={page >= last}
                                aria-label="Next page"
                                className="cursor-pointer transition-opacity hover:opacity-70 disabled:cursor-default disabled:opacity-30"
                            >
                                <Chevron dir="right" />
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* ---------- BOOK WITH PAGE FLIP ---------- */}
            {stage === 'book' && !isMobile && (
                <>
                    <button
                        type="button"
                        onClick={close}
                        aria-label="Close catalog"
                        className="absolute right-5 top-4 z-20 cursor-pointer text-3xl leading-none text-white transition-opacity hover:opacity-70"
                    >
                        ×
                    </button>

                    {page > 0 && (
                        <button
                            type="button"
                            onClick={() => turn('prev')}
                            aria-label="Previous page"
                            className="absolute left-3 top-1/2 z-20 -translate-y-1/2 cursor-pointer text-white transition-opacity hover:opacity-70 sm:left-6"
                        >
                            <Chevron dir="left" />
                        </button>
                    )}

                    <div style={{ width: `min(100%, ${BOOK_MAX_W}px, calc((100vh - ${BOOK_V_SPACE}px) * ${BOOK_ASPECT}))` }}>
                        <div
                            onClick={onBookClick}
                            className="relative w-full cursor-pointer select-none"
                            style={{
                                aspectRatio: BOOK_ASPECT,
                                perspective: '2600px',
                                transform: `translateX(${closed ? '-25%' : '0'})`,
                                transition: `transform ${FLIP_MS}ms ${EASE}`,
                                filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))',
                            }}
                        >
                            {/* Static left half */}
                            <div
                                className="absolute left-0 top-0 z-[1] h-full w-1/2 overflow-hidden bg-white"
                                style={{ visibility: leftPage && !leftPage.single ? 'visible' : 'hidden' }}
                            >
                                <Half page={leftPage} side="left" />
                            </div>

                            {/* Static right half */}
                            <div className="absolute right-0 top-0 z-[1] h-full w-1/2 overflow-hidden bg-white">
                                <Half page={rightPage} side="right" />
                            </div>

                            {/* Spine shadow */}
                            {!closed && (
                                <div
                                    aria-hidden="true"
                                    className="pointer-events-none absolute left-1/2 top-0 z-[6] h-full w-8 -translate-x-1/2"
                                    style={{ background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.18), transparent)' }}
                                />
                            )}

                            {/* Turning page */}
                            {flip && (
                                <div style={flipStyle}>
                                    {flip.dir === 'next' ? (
                                        <>
                                            <div style={faceStyle}><Half page={pages[page]} side="right" /></div>
                                            <div style={{ ...faceStyle, transform: 'rotateY(180deg)' }}><Half page={pages[page + 1]} side="left" /></div>
                                        </>
                                    ) : (
                                        <>
                                            <div style={faceStyle}><Half page={pages[page]} side="left" /></div>
                                            <div style={{ ...faceStyle, transform: 'rotateY(180deg)' }}><Half page={pages[page - 1]} side="right" /></div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {page < last && (
                        <button
                            type="button"
                            onClick={() => turn('next')}
                            aria-label="Next page"
                            className="absolute right-3 top-1/2 z-20 -translate-y-1/2 cursor-pointer text-white transition-opacity hover:opacity-70 sm:right-6"
                        >
                            <Chevron dir="right" />
                        </button>
                    )}

                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs text-white/70">
                        {page} / {last}
                    </div>
                </>
            )}
        </section>
    );
}