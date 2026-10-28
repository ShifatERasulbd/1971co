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
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Bebas+Neue&display=swap');
.catalog-font, .catalog-font * { font-family: 'Montserrat', sans-serif !important; }

/* Cut-out model walking round the studio floor.
   walk = an oval path: front (big, low) -> right -> back (small, higher up) -> left -> front,
          turning slightly towards the way they are going
   step = the bounce and side-to-side rock of each footstep */
@keyframes catalog-model-walk {
    0%, 100% { transform: perspective(1200px) translate(0, 1%) scale(1.03) rotateY(15deg); }
    12.5% { transform: perspective(1200px) translate(9.9%, 0.4%) scale(1.011) rotateY(10.6deg); }
    25% { transform: perspective(1200px) translate(14%, -1%) scale(0.965) rotateY(0deg); }
    37.5% { transform: perspective(1200px) translate(9.9%, -2.4%) scale(0.919) rotateY(-10.6deg); }
    50% { transform: perspective(1200px) translate(0, -3%) scale(0.9) rotateY(-15deg); }
    62.5% { transform: perspective(1200px) translate(-9.9%, -2.4%) scale(0.919) rotateY(-10.6deg); }
    75% { transform: perspective(1200px) translate(-14%, -1%) scale(0.965) rotateY(0deg); }
    87.5% { transform: perspective(1200px) translate(-9.9%, 0.4%) scale(1.011) rotateY(10.6deg); }
}
@keyframes catalog-model-step {
    0%, 100% { transform: translateY(0) rotate(-1deg); }
    25% { transform: translateY(-1.2%) rotate(0deg); }
    50% { transform: translateY(0) rotate(1deg); }
    75% { transform: translateY(-1.2%) rotate(0deg); }
}
.catalog-model-walk { transform-origin: 50% 92%; animation: catalog-model-walk 16s linear infinite; will-change: transform; }
.catalog-model-step { transform-origin: 50% 92%; animation: catalog-model-step 1.1s ease-in-out infinite; will-change: transform; }
@media (prefers-reduced-motion: reduce) {
    .catalog-model-walk, .catalog-model-step { animation: none; }
}
`;

/* ---------- PDF EXPORT ---------- */

const EXPORT_W = 1700; // px width of one spread in the PDF
const EXPORT_H = Math.round(EXPORT_W / BOOK_ASPECT);
const EXPORT_FILE = '1971co-catalogue.pdf';

// True while the hidden export copy is rendered (turns off lazy image loading)
const ExportCtx = createContext(false);

// Watermark images still being prepared (the PDF export waits for these)
const overlayJobs = new Set();

const waitForImages = async (root) => {
    await Promise.allSettled([...overlayJobs]);
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
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

const catalogImage = (image) => {
    if (typeof image !== 'string') return '';
    const value = image.trim();
    if (!value) return '';
    if (/^(https?:|data:|blob:|\/)/i.test(value)) return value;
    return `/${value}`;
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

    // Only images explicitly selected as catalog features belong in the feature gallery.
    const catalogFeatures = toArray(p.catalog_feature_images).map(catalogImage).filter(Boolean);
    const tankTopBundleGallery = isTankTopBundle
        ? catalogFeatures.slice(0, 4)
        : [];
    const gallery = isTankTopBundle
        ? tankTopBundleGallery
        : catalogFeatures.slice(0, 6);

    return {
        product: p,
        image: catalogImage(p.catalog_thumb_image) || catalogImage(p.cover_image) || gallery[0] || '',
   
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
    ['hoodie'],
    ['sweatshirt'],
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
        const productName = String(product.name || '')
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '');
        if (productName.includes('polo')) return 1;
        if (productName.includes('hoodie')) return 2;
        if (productName.includes('sweatshirt')) return 3;

        const productNameOrder = PRODUCT_CATEGORY_ORDER.findIndex((terms) =>
            terms.some((term) => productName.includes(term)),
        );
        if (productNameOrder !== -1) return productNameOrder;

        const categoryText = [
            product.sku,
            grandchild?.name,
            grandchild?.slug,
            subcategory?.name,
            subcategory?.slug,
        ]
            .join(' ')
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '');

        if (categoryText.includes('polo')) return 1;
        if (categoryText.includes('hoodie')) return 2;
        if (categoryText.includes('sweatshirt')) return 3;

        return PRODUCT_CATEGORY_ORDER.findIndex((terms) => terms.some((term) => categoryText.includes(term)));
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
            // The tank top bundle uses layout C (slanted photos), like the other products
            return { ...view, layout: view.isTankTopBundle ? 2 : i % LAYOUTS.length };
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

/* ---------- PRODUCT FEATURES (shared by every layout) ---------- */

// Thin outlined badge icons, one per kind of feature
const FEATURE_ICON_PATHS = {
    fabric: (
        <>
            <circle cx="12" cy="12" r="9" />
            <path d="M8.5 7.5c1 1.5 1 3 0 4.5s-1 3 0 4.5M12 6.5c1 1.5 1 3.5 0 5.5s-1 3.5 0 5.5M15.5 7.5c1 1.5 1 3 0 4.5s-1 3 0 4.5" />
        </>
    ),
    soft: (
        <>
            <path d="M12 3l7.8 4.5v9L12 21l-7.8-4.5v-9z" />
            <path d="M8 10.5c1.3-1 2.7-1 4 0s2.7 1 4 0M8 14c1.3-1 2.7-1 4 0s2.7 1 4 0" />
        </>
    ),
    quality: (
        <>
            <circle cx="12" cy="12" r="9" />
            <circle cx="12" cy="12" r="5.5" />
            <circle cx="12" cy="12" r="1.8" />
        </>
    ),
    weight: (
        <>
            <circle cx="12" cy="12" r="9" />
            <path d="M10 7.5v9h1.5a4.5 4.5 0 0 0 0-9z" />
        </>
    ),
    drop: (
        <>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 6.5c2.5 3 4 4.8 4 7a4 4 0 0 1-8 0c0-2.2 1.5-4 4-7z" />
        </>
    ),
    fit: (
        <>
            <circle cx="12" cy="12" r="9" />
            <path d="M7.5 12h9M10.5 9.5L8 12l2.5 2.5M13.5 9.5L16 12l-2.5 2.5" />
        </>
    ),
};

const FEATURE_ICON_ORDER = ['fabric', 'soft', 'quality', 'weight'];

const FEATURE_ICON_RULES = [
    ['weight', /gsm|weight|gram|thick|heavy/],
    ['soft', /soft|comfort|smooth|cozy|cosy/],
    ['quality', /quality|lasting|durab|strong|premium|stitch/],
    ['drop', /breath|cool|dry|moisture|sweat|wick/],
    ['fit', /fit|size|relax|oversize|regular/],
    ['fabric', /lycra|rib|cotton|fabric|knit|stretch|fleece|polyester|blend|spandex|yarn|elastic/],
];

// Picks an icon from the feature text; unknown text cycles through the set
const featureIconKey = (text, index) => {
    const t = String(text).toLowerCase();
    const hit = FEATURE_ICON_RULES.find(([, re]) => re.test(t));
    return hit ? hit[0] : FEATURE_ICON_ORDER[index % FEATURE_ICON_ORDER.length];
};

function FeatureIcon({ name, className = '' }) {
    return (
        <svg
            viewBox="0 0 24 24"
            className={className}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {FEATURE_ICON_PATHS[name]}
        </svg>
    );
}

// "Product Features" heading + one icon-and-text row per feature
function FeatureList({ features, max = 6 }) {
    return (
        <div className="border-b border-zinc-300 pb-[2cqw]">
            <p className="text-[2.3cqw] font-medium tracking-[0.08em] text-zinc-800">Product Features</p>
            <ul className="mt-[1.6cqw] flex flex-col gap-[1.5cqw]">
                {features.slice(0, max).map((f, i) => (
                    <li key={`${f}-${i}`} className="flex min-w-0 items-center gap-[1.6cqw] text-[1.9cqw] leading-snug tracking-[0.02em] text-zinc-700">
                        <FeatureIcon name={featureIconKey(f, i)} className="size-[3.4cqw] shrink-0 text-zinc-700" />
                        <span className="line-clamp-2 min-w-0">{f}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

/* ---------- WATERMARK BEHIND THE MODEL ---------- */
// The big brand name behind the model is drawn by the browser, per photo:
//   1. find the plain studio backdrop (computeBackdropMask)
//   2. draw the text, keep it only where the backdrop is, so it ends up BEHIND the model
//   3. show that as a transparent image on top of the photo (works in the PDF export too)
// If a photo can't be read (different site without CORS, or not a plain backdrop) there is no
// watermark on it, rather than a wrong one over the model.

const MASK_MAX = 360; // px: photo size used to find the backdrop
const OVERLAY_MAX = 1100; // px: size of the finished watermark image
const LAYER_MAX = 1600; // px: size of the moving-model layers (cut-out model, empty backdrop, text)
const WATERMARK_ALPHA = 0.1; // how dark the text is (0 to 1)
const WATERMARK_WIDTH = 0.9; // text width as a share of the photo width
const WATERMARK_STRETCH = 1.6; // makes the letters taller
const WATERMARK_CENTER_Y = 0.33; // text centre as a share of the photo height

// Finds the plain studio backdrop of a model photo.
// Input: RGBA pixels. Output: Uint8ClampedArray (w*h), 255 = backdrop, 0 = model, soft edges.
// Returns null when the photo doesn't look like "one person on a plain backdrop".
const EDGE_STRONG = 24; // Sobel strength that counts as a real edge

function computeBackdropMask(rgba, w, h) {
    const n = w * h;

    // Square min filter (shrinks a 0/1 mask by r). Pixels outside the photo are ignored.
    const erode = (src, r) => {
        const tmp = new Uint8Array(n);
        const out = new Uint8Array(n);
        for (let y = 0; y < h; y += 1) {
            for (let x = 0; x < w; x += 1) {
                let v = 1;
                for (let d = -r; d <= r && v; d += 1) {
                    const xx = x + d;
                    if (xx >= 0 && xx < w && !src[y * w + xx]) v = 0;
                }
                tmp[y * w + x] = v;
            }
        }
        for (let y = 0; y < h; y += 1) {
            for (let x = 0; x < w; x += 1) {
                let v = 1;
                for (let d = -r; d <= r && v; d += 1) {
                    const yy = y + d;
                    if (yy >= 0 && yy < h && !tmp[yy * w + x]) v = 0;
                }
                out[y * w + x] = v;
            }
        }
        return out;
    };

    // Square max filter (grows a 0/1 mask by r)
    const dilate = (src, r) => {
        const inv = new Uint8Array(n);
        for (let i = 0; i < n; i += 1) inv[i] = src[i] ? 0 : 1;
        const e = erode(inv, r);
        for (let i = 0; i < n; i += 1) e[i] = e[i] ? 0 : 1;
        return e;
    };

    // 1) Light 3x3 blur so JPEG noise doesn't break the fill
    const ch = [new Uint8Array(n), new Uint8Array(n), new Uint8Array(n)];
    for (let c = 0; c < 3; c += 1) {
        const out = ch[c];
        for (let y = 0; y < h; y += 1) {
            for (let x = 0; x < w; x += 1) {
                let sum = 0;
                let cnt = 0;
                for (let dy = -1; dy <= 1; dy += 1) {
                    const yy = y + dy;
                    if (yy < 0 || yy >= h) continue;
                    for (let dx = -1; dx <= 1; dx += 1) {
                        const xx = x + dx;
                        if (xx < 0 || xx >= w) continue;
                        sum += rgba[(yy * w + xx) * 4 + c];
                        cnt += 1;
                    }
                }
                out[y * w + x] = Math.round(sum / cnt);
            }
        }
    }
    const [R, G, B] = ch;
    const lum = new Float32Array(n);
    const chroma = new Uint8Array(n);
    for (let i = 0; i < n; i += 1) {
        lum[i] = (R[i] * 299 + G[i] * 587 + B[i] * 114) / 1000;
        chroma[i] = Math.max(R[i], G[i], B[i]) - Math.min(R[i], G[i], B[i]);
    }

    // Edge strength (Sobel) of the blurred luminance, used to judge how trustworthy an outline is
    const grad = new Float32Array(n);
    for (let y = 1; y < h - 1; y += 1) {
        for (let x = 1; x < w - 1; x += 1) {
            const i = y * w + x;
            const gx = lum[i - w + 1] + 2 * lum[i + 1] + lum[i + w + 1] - lum[i - w - 1] - 2 * lum[i - 1] - lum[i + w - 1];
            const gy = lum[i + w - 1] + 2 * lum[i + w] + lum[i + w + 1] - lum[i - w - 1] - 2 * lum[i - w] - lum[i - w + 1];
            grad[i] = Math.abs(gx) + Math.abs(gy);
        }
    }

    // 2) What does the backdrop look like? Sample the outer edge of the photo.
    const ring = Math.max(2, Math.round(Math.min(w, h) * 0.012));
    const isRing = (x, y) => x < ring || y < ring || x >= w - ring || y >= h - ring;
    const ringIdx = [];
    for (let y = 0; y < h; y += 1) {
        for (let x = 0; x < w; x += 1) {
            if (!isRing(x, y)) {
                x = Math.max(x, w - ring - 1);
                continue;
            }
            ringIdx.push(y * w + x);
        }
    }
    const pct = (values, p) => {
        const sorted = Float32Array.from(values).sort();
        return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))];
    };
    const ringLum = ringIdx.map((i) => lum[i]);
    const ringChroma = ringIdx.map((i) => chroma[i]);
    const lumLo = pct(ringLum, 0.15) - 12; // percentile, so a model touching the edge is ignored
    const ringHi = pct(ringLum, 0.95);
    const chromaMax = Math.min(26, pct(ringChroma, 0.95) + 7);
    if (ringHi + 12 - lumLo > 90) return null; // edge is not a plain backdrop

    const queue = new Int32Array(n);
    const floodFromRing = (accept) => {
        const out = new Uint8Array(n);
        let head = 0;
        let tail = 0;
        for (let k = 0; k < ringIdx.length; k += 1) {
            const i = ringIdx[k];
            if (accept(i, -1)) {
                out[i] = 1;
                queue[tail++] = i;
            }
        }
        while (head < tail) {
            const i = queue[head++];
            const x = i % w;
            const y = (i - x) / w;
            const nb = [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, y > 0 ? i - w : -1, y < h - 1 ? i + w : -1];
            for (let k = 0; k < 4; k += 1) {
                const j = nb[k];
                if (j >= 0 && !out[j] && accept(j, i)) {
                    out[j] = 1;
                    queue[tail++] = j;
                }
            }
        }
        return out;
    };

    const attempt = ({ step: STEP, hiMargin }) => {
        const lumHi = ringHi + hiMargin;
        const okColor = (i) => lum[i] >= lumLo && lum[i] <= lumHi && chroma[i] <= chromaMax;
        const step = (i, j) =>
            Math.abs(R[i] - R[j]) <= STEP && Math.abs(G[i] - G[j]) <= STEP && Math.abs(B[i] - B[j]) <= STEP;

        // 3) Flood fill inwards from the photo edge; edges between colours stop it
        let bg = floodFromRing((j, from) => okColor(j) && (from < 0 || step(from, j)));

        // 4) Cut narrow "necks" (shaded white clothing that looks like backdrop) and keep only
        //    the part still connected to the photo edge
        const r = Math.max(3, Math.round(Math.min(w, h) * 0.03));
        const core = erode(bg, r);
        const opened = dilate(core, r);
        for (let i = 0; i < n; i += 1) opened[i] = opened[i] && bg[i] ? 1 : 0;
        bg = floodFromRing((j, from) => opened[j] === 1 && (from < 0 || opened[from] === 1));

        // 5) Drop tiny specks of "model" inside the backdrop (noise, dust)
        const minBlob = Math.max(30, Math.round(n * 0.0015));
        const seen = new Uint8Array(n);
        let modelPixels = 0;
        let largest = 0;
        for (let s = 0; s < n; s += 1) {
            if (bg[s] || seen[s]) continue;
            let qh = 0;
            let qt = 0;
            queue[qt++] = s;
            seen[s] = 1;
            while (qh < qt) {
                const i = queue[qh++];
                const x = i % w;
                const y = (i - x) / w;
                if (x > 0 && !bg[i - 1] && !seen[i - 1]) { seen[i - 1] = 1; queue[qt++] = i - 1; }
                if (x < w - 1 && !bg[i + 1] && !seen[i + 1]) { seen[i + 1] = 1; queue[qt++] = i + 1; }
                if (y > 0 && !bg[i - w] && !seen[i - w]) { seen[i - w] = 1; queue[qt++] = i - w; }
                if (y < h - 1 && !bg[i + w] && !seen[i + w]) { seen[i + w] = 1; queue[qt++] = i + w; }
            }
            if (qt < minBlob) {
                for (let k = 0; k < qt; k += 1) bg[queue[k]] = 1;
            } else {
                modelPixels += qt;
                if (qt > largest) largest = qt;
            }
        }

        // Sanity: the person should be in the middle, with backdrop around them
        let centre = 0;
        let centreTotal = 0;
        for (let y = Math.floor(h * 0.3); y < Math.floor(h * 0.7); y += 1) {
            for (let x = Math.floor(w * 0.35); x < Math.floor(w * 0.65); x += 1) {
                centreTotal += 1;
                if (!bg[y * w + x]) centre += 1;
            }
        }
        const modelShare = modelPixels / n;
        // one person = one big region; several pieces means the backdrop was cut up
        if (centre / centreTotal < 0.35 || modelShare < 0.04 || modelShare > 0.6 || largest < modelPixels * 0.8) return null;

        // Confidence: a true outline follows strong edges; a leak or bite runs through smooth areas
        let border = 0;
        let strong = 0;
        for (let y = 1; y < h - 1; y += 1) {
            for (let x = 1; x < w - 1; x += 1) {
                const i = y * w + x;
                if (bg[i]) continue;
                if (bg[i - 1] || bg[i + 1] || bg[i - w] || bg[i + w]) {
                    border += 1;
                    if (grad[i] >= EDGE_STRONG) strong += 1;
                }
            }
        }
        return { bg, score: border ? strong / border : 0 };
    };

    // Several strictness levels (loose suits uneven backdrops, strict suits pale clothes).
    // Keep the one whose outline sits best on real edges; stop early once it is clearly good.
    let best = null;
    for (const params of [{ step: 6, hiMargin: 12 }, { step: 8, hiMargin: 18 }, { step: 3, hiMargin: 6 }, { step: 2, hiMargin: 3 }]) {
        const res = attempt(params);
        if (res && (!best || res.score > best.score + 0.02)) best = res;
        if (best && best.score >= 0.85) break;
    }
    if (!best) return null;
    const { bg } = best;

    // 6) Shrink the backdrop a little so the text never touches the model's outline
    const shrunk = erode(bg, Math.max(1, Math.round(Math.min(w, h) * 0.006)));

    // 7) Soften the edge (3x3 box blur) and return as 0..255
    const out = new Uint8ClampedArray(n);
    for (let y = 0; y < h; y += 1) {
        for (let x = 0; x < w; x += 1) {
            let sum = 0;
            let cnt = 0;
            for (let dy = -1; dy <= 1; dy += 1) {
                const yy = y + dy;
                if (yy < 0 || yy >= h) continue;
                for (let dx = -1; dx <= 1; dx += 1) {
                    const xx = x + dx;
                    if (xx < 0 || xx >= w) continue;
                    sum += shrunk[yy * w + xx];
                    cnt += 1;
                }
            }
            out[y * w + x] = Math.round((sum / cnt) * 255);
        }
    }
    return out;
}

// Box blur of the RGB channels (sliding window, horizontal then vertical)
function boxBlurRGB(buf, w, h, r) {
    const tmp = new Float32Array(w * h * 3);
    for (let y = 0; y < h; y += 1) {
        for (let c = 0; c < 3; c += 1) {
            let sum = 0;
            let cnt = 0;
            for (let x = 0; x <= r && x < w; x += 1) { sum += buf[(y * w + x) * 4 + c]; cnt += 1; }
            for (let x = 0; x < w; x += 1) {
                tmp[(y * w + x) * 3 + c] = sum / cnt;
                const add = x + r + 1;
                const rem = x - r;
                if (add < w) { sum += buf[(y * w + add) * 4 + c]; cnt += 1; }
                if (rem >= 0) { sum -= buf[(y * w + rem) * 4 + c]; cnt -= 1; }
            }
        }
    }
    for (let x = 0; x < w; x += 1) {
        for (let c = 0; c < 3; c += 1) {
            let sum = 0;
            let cnt = 0;
            for (let y = 0; y <= r && y < h; y += 1) { sum += tmp[(y * w + x) * 3 + c]; cnt += 1; }
            for (let y = 0; y < h; y += 1) {
                buf[(y * w + x) * 4 + c] = sum / cnt;
                const add = y + r + 1;
                const rem = y - r;
                if (add < h) { sum += tmp[(add * w + x) * 3 + c]; cnt += 1; }
                if (rem >= 0) { sum -= tmp[(rem * w + x) * 3 + c]; cnt -= 1; }
            }
        }
    }
}

// Paints the backdrop over the spot where the model stands (each row is bridged between the
// backdrop on its left and right), so the model can move without a copy of itself showing behind.
// Returns RGBA pixels; alpha is only set where the model was.
function backdropFill(rgba, mask, w, h) {
    const SOLID = 250;
    const out = new Uint8ClampedArray(w * h * 4);
    // average of up to 3 backdrop pixels, going outwards from x
    const sample = (y, x, dir) => {
        let r = 0;
        let g = 0;
        let b = 0;
        let c = 0;
        for (let xx = x; c < 3 && xx >= 0 && xx < w && mask[y * w + xx] >= SOLID; xx += dir) {
            const i = (y * w + xx) * 4;
            r += rgba[i];
            g += rgba[i + 1];
            b += rgba[i + 2];
            c += 1;
        }
        return c ? [r / c, g / c, b / c] : null;
    };

    for (let y = 0; y < h; y += 1) {
        let x = 0;
        while (x < w) {
            const i = y * w + x;
            if (mask[i] >= SOLID) {
                out[i * 4] = rgba[i * 4];
                out[i * 4 + 1] = rgba[i * 4 + 1];
                out[i * 4 + 2] = rgba[i * 4 + 2];
                x += 1;
                continue;
            }
            let x1 = x;
            while (x1 < w && mask[y * w + x1] < SOLID) x1 += 1;
            const L = x > 0 ? sample(y, x - 1, -1) : null;
            const R = x1 < w ? sample(y, x1, 1) : null;
            for (let xx = x; xx < x1; xx += 1) {
                const o = (y * w + xx) * 4;
                if (L && R) {
                    const t = (xx - x + 1) / (x1 - x + 1);
                    for (let c = 0; c < 3; c += 1) out[o + c] = L[c] + (R[c] - L[c]) * t;
                } else if (L || R) {
                    const col = L || R;
                    for (let c = 0; c < 3; c += 1) out[o + c] = col[c];
                } else if (y > 0) {
                    for (let c = 0; c < 3; c += 1) out[o + c] = out[o - w * 4 + c];
                }
            }
            x = x1;
        }
    }

    // Smooth out the row-by-row streaks
    boxBlurRGB(out, w, h, Math.max(2, Math.round(Math.min(w, h) * 0.02)));
    for (let i = 0; i < w * h; i += 1) out[i * 4 + 3] = 255 - mask[i];
    return out;
}

// Big brand name centred on a canvas of the given size
function drawBrandText(ctx, w, h) {
    const family = '"Bebas Neue", "Montserrat", sans-serif';
    ctx.font = `100px ${family}`;
    const naturalWidth = ctx.measureText(BRAND_TEXT).width || 1;
    const fontPx = (100 * w * WATERMARK_WIDTH) / naturalWidth;
    ctx.font = `${fontPx}px ${family}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = `rgba(0, 0, 0, ${WATERMARK_ALPHA})`;
    const glyphHeight = ctx.measureText(BRAND_TEXT).actualBoundingBoxAscent || fontPx * 0.7;
    ctx.save();
    ctx.translate(w / 2, h * WATERMARK_CENTER_Y);
    ctx.scale(1, WATERMARK_STRETCH);
    ctx.fillText(BRAND_TEXT, 0, glyphHeight / 2);
    ctx.restore();
}

const makeCanvas = (w, h) => {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    return canvas;
};

// Browsers without WebP encoding fall back to PNG
const canvasUrl = (canvas, type = 'image/webp', quality = 0.92) =>
    new Promise((resolve) => canvas.toBlob((blob) => resolve(blob ? URL.createObjectURL(blob) : null), type, quality));

const loadImage = (src) =>
    new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Waits (up to ~3s) for the watermark font so the first photo doesn't use a fallback font
async function loadWatermarkFont() {
    const ready = () =>
        Array.from(document.fonts || []).some((f) => f.family.replace(/["']/g, '') === 'Bebas Neue' && f.status === 'loaded');
    for (let i = 0; i < 30 && !ready(); i += 1) {
        try {
            await document.fonts.load('100px "Bebas Neue"', BRAND_TEXT);
        } catch {
            /* ignore */
        }
        if (ready()) break;
        await sleep(100);
    }
}

async function buildWatermarkOverlay(src) {
    const img = await loadImage(src);
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    if (!nw || !nh) return null;

    // 1) Backdrop mask from a small copy of the photo
    const ms = Math.min(1, MASK_MAX / Math.max(nw, nh));
    const mw = Math.max(1, Math.round(nw * ms));
    const mh = Math.max(1, Math.round(nh * ms));
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = mw;
    maskCanvas.height = mh;
    const maskCtx = maskCanvas.getContext('2d', { willReadFrequently: true });
    maskCtx.drawImage(img, 0, 0, mw, mh);
    const pixels = maskCtx.getImageData(0, 0, mw, mh).data;
    const mask = computeBackdropMask(pixels, mw, mh);
    if (!mask) return null;

    const alpha = maskCtx.createImageData(mw, mh);
    for (let i = 0; i < mask.length; i += 1) alpha.data[i * 4 + 3] = mask[i];
    maskCtx.putImageData(alpha, 0, 0);

    // 2) Text on a canvas with the same proportions as the photo
    const os = Math.min(1, OVERLAY_MAX / Math.max(nw, nh));
    const ow = Math.max(1, Math.round(nw * os));
    const oh = Math.max(1, Math.round(nh * os));
    const canvas = makeCanvas(ow, oh);
    const ctx = canvas.getContext('2d');

    await loadWatermarkFont();
    drawBrandText(ctx, ow, oh);

    // 3) Keep the text only where the backdrop is
    ctx.globalCompositeOperation = 'destination-in';
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(maskCanvas, 0, 0, ow, oh);
    const overlay = canvas.toDataURL('image/png');

    // 4) Layers for the moving model: empty backdrop, full text, and the model cut out on its own
    const ls = Math.min(1, LAYER_MAX / Math.max(nw, nh));
    const lw = Math.max(1, Math.round(nw * ls));
    const lh = Math.max(1, Math.round(nh * ls));

    const fillCanvas = makeCanvas(mw, mh);
    fillCanvas.getContext('2d').putImageData(new ImageData(backdropFill(pixels, mask, mw, mh), mw, mh), 0, 0);
    const plateCanvas = makeCanvas(lw, lh);
    const plateCtx = plateCanvas.getContext('2d');
    plateCtx.imageSmoothingQuality = 'high';
    plateCtx.drawImage(img, 0, 0, lw, lh);
    plateCtx.drawImage(fillCanvas, 0, 0, lw, lh);

    const textCanvas = makeCanvas(lw, lh);
    drawBrandText(textCanvas.getContext('2d'), lw, lh);

    const modelCanvas = makeCanvas(lw, lh);
    const modelCtx = modelCanvas.getContext('2d');
    modelCtx.imageSmoothingQuality = 'high';
    modelCtx.drawImage(img, 0, 0, lw, lh);
    modelCtx.globalCompositeOperation = 'destination-out';
    modelCtx.drawImage(maskCanvas, 0, 0, lw, lh);

    const [plate, text, model] = await Promise.all([
        canvasUrl(plateCanvas, 'image/jpeg'),
        canvasUrl(textCanvas),
        canvasUrl(modelCanvas),
    ]);

    return { overlay, plate, text, model };
}

const overlayCache = new Map(); // photo url -> Promise of the watermark layers (or null)
const overlayDone = new Map(); // photo url -> finished watermark layers (or null)

function getWatermarkOverlay(src) {
    if (!overlayCache.has(src)) {
        const job = buildWatermarkOverlay(src)
            .catch(() => null)
            .then((url) => {
                overlayDone.set(src, url);
                return url;
            });
        overlayCache.set(src, job);
        overlayJobs.add(job);
        job.finally(() => overlayJobs.delete(job));
    }
    return overlayCache.get(src);
}

// Prepares the watermarks one by one in the background so turning pages stays smooth.
// Returns a function that stops it.
function prewarmWatermarks(srcs) {
    let cancelled = false;
    (async () => {
        await sleep(1200); // let the page settle first
        for (const src of srcs) {
            if (cancelled) return;
            await getWatermarkOverlay(src);
            await sleep(80);
        }
    })();
    return () => {
        cancelled = true;
    };
}

function useWatermarkOverlay(src, enabled) {
    const [url, setUrl] = useState(() => (enabled && src ? overlayDone.get(src) ?? null : null));

    useEffect(() => {
        if (!enabled || !src) {
            setUrl(null);
            return undefined;
        }
        if (overlayDone.has(src)) {
            setUrl(overlayDone.get(src));
            return undefined;
        }
        let alive = true;
        setUrl(null);
        getWatermarkOverlay(src).then((result) => {
            if (alive) setUrl(result);
        });
        return () => {
            alive = false;
        };
    }, [src, enabled]);

    return url;
}

// Never crops: the whole image is always visible inside a fixed-size frame.
// blur = fills any empty edges with a blurred copy (use on the big photos).
// animate = the model (only the model) gently moves; backdrop and text stay still.
function Photo({ src, alt = '', blur = false, watermark = false, animate = false, cover = false, className = '' }) {
    const exporting = useContext(ExportCtx);
    const layers = useWatermarkOverlay(src, watermark || animate);
    const fit = cover ? 'object-cover' : 'object-contain';
    const moving = animate && !exporting && layers?.model && layers?.plate;

    return (
        <div className={`relative size-full min-h-0 min-w-0 overflow-hidden bg-[#e6e8e8] ${className}`}>
            {blur && !cover && (
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
                className={`relative size-full ${fit}`}
            />
            {moving ? (
                // Backdrop without the model, brand name, then the cut-out model moving on top
                <>
                    <img src={layers.plate} alt="" aria-hidden="true" draggable={false} className={`pointer-events-none absolute inset-0 size-full select-none ${fit}`} />
                    {watermark && layers.text && (
                        <img src={layers.text} alt="" aria-hidden="true" draggable={false} className={`pointer-events-none absolute inset-0 size-full select-none ${fit}`} />
                    )}
                    <div className="catalog-model-sway pointer-events-none absolute inset-0">
                        <div className="catalog-model-breathe size-full">
                            <img src={layers.model} alt="" aria-hidden="true" draggable={false} className={`size-full select-none ${fit}`} />
                        </div>
                    </div>
                </>
            ) : (
                watermark && layers?.overlay && (
                    // Brand name already cut out around the model, so it sits behind them
                    <img
                        src={layers.overlay}
                        alt=""
                        aria-hidden="true"
                        draggable={false}
                        className={`pointer-events-none absolute inset-0 size-full select-none ${fit}`}
                    />
                )
            )}
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

// Three photos as a fanned card gallery: big card in the middle, smaller tilted cards behind on each side.
// Photos only, no colour names. Fills the space it is given.
function GalleryFan({ images }) {
    const list = images.filter(Boolean).slice(0, 4);
    if (list.length === 0) return <div className="min-h-0 flex-1" />;

    // Keep all selected feature images visible, layering the fourth behind the left card.
    const slots =
        list.length >= 4
            ? [list[0], list[1], list[2], list[3]]
            : list.length === 3
              ? [list[0], list[1], list[2]]
              : list.length === 2
                ? [null, list[0], list[1]]
                : [null, list[0], null];

    const card = 'absolute overflow-hidden rounded-[1.6cqw] bg-[#e6e8e8]';
    const side = { top: '10%', height: '80%', width: '42%', opacity: 0.95, boxShadow: '0 1.2cqw 2.4cqw rgba(0,0,0,0.12)' };

    return (
        // Fixed-proportion box (matches the red area): full column width, height follows the ratio, sits at the top
        <div className="relative w-[90%] shrink-0 self-start" style={{ aspectRatio: '407 / 520', padding: '1cqw 0' }}>
            <div className="relative size-full">
                {slots[0] && (
                    <div className={card} style={{ ...side, left: '-8%', transform: 'rotate(-12deg)', zIndex: 1 }}>
                        <Photo src={slots[0]} cover />
                    </div>
                )}
                {slots[3] && (
                    <div className={card} style={{ ...side, left: '-1%', transform: 'rotate(-6deg)', zIndex: 0 }}>
                        <Photo src={slots[3]} cover />
                    </div>
                )}
                {slots[2] && (
                    <div className={card} style={{ ...side, right: '-6%', transform: 'rotate(12deg)', zIndex: 1 }}>
                        <Photo src={slots[2]} cover />
                    </div>
                )}
                {slots[1] && (
                    <div
                        className={card}
                        style={{
                            top: 0,
                            height: '100%',
                            width: '46%',
                            left: '27%',
                            zIndex: 2,
                            boxShadow: '0 2cqw 4cqw rgba(0,0,0,0.22)',
                            outline: '0.5cqw solid rgba(255,255,255,0.85)',
                        }}
                    >
                        <Photo src={slots[1]} cover />
                    </div>
                )}
            </div>
        </div>
    );
}

// Photo collage for 3 images: two stacked on the left, one tall photo on the right.
// Order: [0] top-left, [1] tall right, [2] bottom-left. Photos fill their tiles (cropped).
function CollageTile({ src, className = '', style }) {
    const exporting = useContext(ExportCtx);

    return (
        <div className={`min-h-0 min-w-0 overflow-hidden bg-[#e6e8e8] ${className}`} style={style}>
            <img
                src={src}
                alt=""
                loading={exporting ? undefined : 'lazy'}
                draggable={false}
                className="size-full object-cover"
                style={{ objectPosition: 'center 30%' }}
            />
        </div>
    );
}

function CollageGrid({ images }) {
    const [a, b, c] = images;

    return (
        <div
            className="grid w-full shrink-0 gap-[0.8cqw] bg-white p-[0.8cqw]"
            style={{
                aspectRatio: '620 / 640',
                gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)',
                gridTemplateRows: 'minmax(0, 1.36fr) minmax(0, 1fr)',
            }}
        >
            {a && <CollageTile src={a} style={{ gridColumn: 1, gridRow: 1 }} />}
            {b && <CollageTile src={b} style={{ gridColumn: 2, gridRow: '1 / span 2' }} />}
            {c && <CollageTile src={c} style={{ gridColumn: 1, gridRow: 2 }} />}
        </div>
    );
}

// Polygon with softly rounded corners, in 0..1 box coordinates (for clip-path)
function roundedPolyPath(pts, r) {
    const n = pts.length;
    const toward = (a, b, dist) => {
        const dx = b[0] - a[0];
        const dy = b[1] - a[1];
        const t = Math.min(dist / (Math.hypot(dx, dy) || 1), 0.45);
        return [a[0] + dx * t, a[1] + dy * t];
    };
    let d = '';
    for (let i = 0; i < n; i++) {
        const cur = pts[i];
        const a = toward(cur, pts[(i + n - 1) % n], r);
        const b = toward(cur, pts[(i + 1) % n], r);
        d += `${i === 0 ? 'M' : 'L'} ${a[0].toFixed(4)} ${a[1].toFixed(4)} Q ${cur[0]} ${cur[1]} ${b[0].toFixed(4)} ${b[1].toFixed(4)} `;
    }
    return `${d}Z`;
}

// Left side lower than the right side: a slanted (parallelogram) photo card
const FEATURE_SKEW_PATH = roundedPolyPath([[0, 0.245], [1, 0], [1, 0.755], [0, 1]], 0.03);
// The small cards use the same slant as the big photo (same slope), so their top edges run parallel to its bottom edge.
// The 2nd card is lifted by slope x (card width + gap) so both cards keep the same distance from the big photo.
const FEATURE_SMALL_PATH = roundedPolyPath([[0, 0.265], [1, 0], [1, 0.735], [0, 1]], 0.045); // same slant as before, on a taller card (FEATURE_SMALL_TALL)
const FEATURE_SMALL_TALL = '130%'; // small card height vs its layout slot: taller cards without moving the big photo
const FEATURE_SMALL_LIFT = '10.4cqw';
const FEATURE_SMALL_RAISE = '10.3cqw'; // moves both small cards up, closer to the big photo

// One big slanted photo with the other photos as small cards under it (no thumbnail strip).
// Click a small card to bring that photo up into the big slanted card.
function FeatureShowcase({ images }) {
    const slides = images.filter(Boolean).slice(0, 3);
    const [mainIndex, setMainIndex] = useState(0);

    if (slides.length === 0) return <div className="min-h-0 flex-1" />;

    const main = slides[mainIndex] || slides[0];
    const others = slides.map((src, index) => ({ src, index })).filter((item) => item.index !== mainIndex);

    return (
        <div className="flex min-h-0 size-full flex-col gap-[1.8cqw]">
            <svg width="0" height="0" className="absolute" aria-hidden="true">
                <defs>
                    <clipPath id="catFeatureSkewClip" clipPathUnits="objectBoundingBox"><path d={FEATURE_SKEW_PATH} /></clipPath>
                    <clipPath id="catFeatureSmallClip" clipPathUnits="objectBoundingBox"><path d={FEATURE_SMALL_PATH} /></clipPath>
                </defs>
            </svg>

            <div className="relative min-h-0 flex-1" style={{ filter: 'drop-shadow(0 0.8cqw 1.6cqw rgba(0,0,0,0.14))' }}>
                <div className="absolute inset-0 bg-[#e6e8e8]" style={{ clipPath: 'url(#catFeatureSkewClip)' }}>
                    <Photo key={main} src={main} alt="Product feature" cover />
                </div>
            </div>

            {others.length > 0 && (
                <div
                    className="grid shrink-0 gap-[1.5cqw]"
                    style={{ gridTemplateColumns: `repeat(${others.length}, minmax(0, 1fr))`, filter: 'drop-shadow(0 0.6cqw 1.2cqw rgba(0,0,0,0.12))', transform: `translateY(-${FEATURE_SMALL_RAISE})` }}
                >
                    {others.map(({ src, index }, i) => (
                        <button
                            key={`${src}-${index}`}
                            type="button"
                            onClick={(event) => {
                                event.stopPropagation(); // don't turn the page
                                setMainIndex(index);
                            }}
                            aria-label={`Show product feature image ${index + 1}`}
                            className="aspect-[3/4] min-w-0 cursor-pointer bg-transparent outline-none"
                            style={{ transform: i > 0 ? `translateY(-${FEATURE_SMALL_LIFT})` : undefined }}
                        >
                            <div className="w-full bg-[#e6e8e8]" style={{ height: FEATURE_SMALL_TALL, clipPath: 'url(#catFeatureSmallClip)' }}>
                                <Photo src={src} alt="" cover />
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// Square swatch slot sized to 4in x 4in in the exported catalog.
function SwatchSquare({ image, className = '' }) {
    return (
        <div className={`flex aspect-square shrink-0 border border-zinc-300 bg-white/60 p-[1.6cqw] ${className}`}>
            <div className="min-h-0 min-w-0 flex-1 overflow-hidden border border-dashed border-zinc-400 bg-zinc-100">
                {image && <Photo src={image} alt="Swatch fabric" cover />}
            </div>
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

const POUR_MS = 1150; // big photo: colour drops from the top and fills the model photo
const THUMB_POUR_MS = 1000;
const THUMB_STAGGER_MS = 350;
const POUR_FALLBACK = '#9ca3af';
const POUR_LAG = 22; // % of the box height between the liquid front and the finished colour photo

// Clip shape of liquid that has filled the box down to `level` (% of height) with a wavy surface
function liquidPolygon(level, phase, amp) {
    const N = 18;
    const pts = ['0% 0%', '100% 0%'];
    for (let i = N; i >= 0; i--) {
        const y = level + Math.sin((i / N) * Math.PI * 3 + phase) * amp;
        pts.push(`${(i / N) * 100}% ${Math.max(0, Math.min(100, y))}%`);
    }
    return `polygon(${pts.join(',')})`;
}

// Starts as a black & white photo (no colour). The colour is poured in from the top like water:
// the liquid tints the light parts (the t-shirt) while its wavy surface sinks down the box, and the
// real colour photo is revealed right behind the liquid.
function PourReveal({ hex, delay = 0, duration = 1000, amp = 3, instant = false, children }) {
    const colRef = useRef(null);
    const imgRef = useRef(null);
    const streamRef = useRef(null);
    const hidden = useMemo(() => liquidPolygon(-amp - POUR_LAG, 0, amp), [amp]);

    useEffect(() => {
        if (instant) return undefined;
        let raf;
        const t0 = performance.now() + delay;
        const tick = (now) => {
            const t = Math.min(1, Math.max(0, (now - t0) / duration));
            const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; // ease in-out
            const span = 100 + 2 * amp + POUR_LAG;
            const front = -amp - POUR_LAG + e * span + POUR_LAG; // liquid colour front
            const photo = front - POUR_LAG; // real colour photo follows behind it
            const phase = now / 170;
            if (colRef.current) colRef.current.style.clipPath = liquidPolygon(front, phase, amp);
            if (imgRef.current) imgRef.current.style.clipPath = t >= 1 ? 'none' : liquidPolygon(photo, phase + 1.3, amp);
            if (streamRef.current) {
                streamRef.current.style.height = `${Math.max(0, Math.min(100, front))}%`;
                streamRef.current.style.opacity = t > 0 && t < 0.4 ? String(1 - t / 0.4) : '0';
            }
            if (t < 1) raf = requestAnimationFrame(tick);
            else if (colRef.current) colRef.current.style.display = 'none';
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [instant, delay, duration, amp]);

    if (instant) return <div className="absolute inset-0">{children}</div>;

    return (
        <div className="absolute inset-0 isolate overflow-hidden">
            {/* 1. no colour yet: black & white photo */}
            <div className="absolute inset-0" style={{ filter: 'grayscale(1) brightness(1.12)' }}>
                {children}
            </div>
            {/* 2. the poured colour, tinting the light parts (t-shirt) of the photo */}
            <div ref={colRef} className="absolute inset-0" style={{ background: hex || POUR_FALLBACK, mixBlendMode: 'multiply', clipPath: hidden }} />
            {/* 3. the finished colour photo, revealed behind the liquid */}
            <div ref={imgRef} className="absolute inset-0" style={{ clipPath: hidden }}>
                {children}
            </div>
            <div
                ref={streamRef}
                aria-hidden="true"
                className="absolute left-1/2 top-0 w-[4%] -translate-x-1/2 rounded-b-full"
                style={{ background: hex || POUR_FALLBACK, height: 0, opacity: 0 }}
            />
        </div>
    );
}

// Colour thumbnail: starts empty, then its colour is poured in from the top and the model fills in
const COLOR_THUMB_ZOOM = 1.0 // 1 = whole photo
const COLOR_THUMB_ORIGIN = '50% 24%'; // the point that stays put while zooming (head / chest)

function ColorThumb({ color, index, selected, exporting, onPick }) {
    const delay = index * THUMB_STAGGER_MS;

    return (
        <button
            type="button"
            onClick={(e) => {
                e.stopPropagation(); // don't turn the page
                onPick(color);
            }}
            className="flex min-h-0 min-w-0 cursor-pointer flex-col items-center outline-none"
        >
            <div className="relative min-h-0 w-full flex-1 overflow-hidden bg-zinc-200/70">
                {color.image && (
                    <PourReveal hex={color.hex} delay={delay} duration={THUMB_POUR_MS} amp={4} instant={exporting}>
                        <img
                            src={color.image}
                            alt={color.name}
                            draggable={false}
                            loading={exporting ? undefined : 'lazy'}
                            className="absolute inset-0 size-full object-cover object-top"
                            /* zoomed in on the head and upper body so the garment colour is easy to see */
                            style={{ transform: `scale(${COLOR_THUMB_ZOOM})`, transformOrigin: COLOR_THUMB_ORIGIN }}
                        />
                    </PourReveal>
                )}
            </div>
            <p className={`mt-[1cqw] w-full truncate text-center text-[1.8cqw] ${selected ? 'font-semibold text-zinc-900' : 'text-zinc-600'}`}>
                {color.name}
            </p>
        </button>
    );
}

function HeroPage({ view, side = 'left', nameStrip = false }) {
    const { product, image, colors } = view;
    // outer margin is wider than the margin next to the spine
    const inset = { marginLeft: side === 'left' ? '9%' : '6%', width: '85%' };
    const exporting = useContext(ExportCtx);
    const [shown, setShown] = useState(image);
    const [incoming, setIncoming] = useState(null); // { id, src, hex } photo being poured in over the current one
    const [activeId, setActiveId] = useState(null);
    const timers = useRef([]);

    useEffect(() => () => timers.current.forEach(clearTimeout), []);
    useEffect(() => setShown(image), [image]);

    const pick = (color) => {
        const target = color.image || image;
        setActiveId(color.id);
        timers.current.forEach(clearTimeout);
        if (exporting) {
            setShown(target);
            return;
        }
        if (incoming) setShown(incoming.src); // finish an unfinished pour first
        if (target === shown && !incoming) return;
        setIncoming({ id: Date.now(), src: target, hex: color.hex });
        timers.current = [
            setTimeout(() => {
                setShown(target);
                setIncoming(null);
            }, POUR_MS + 80),
        ];
    };

    const thumbs = colors.slice(0, 4);

    return (
        <div className="relative flex size-full flex-col overflow-hidden" style={{ ...CQ, background: 'linear-gradient(135deg, #f5f5f4 0%, #d9d9dc 100%)' }}>
            {shown && (
                <div className="relative min-h-0 flex-1" style={{ ...inset, marginBottom: '1cqw' }}>
                    <Photo key={shown} src={shown} alt={product.name} cover watermark animate />
                    {incoming && (
                        <PourReveal key={incoming.id} hex={incoming.hex} duration={POUR_MS} amp={2.5}>
                            <Photo src={incoming.src} alt={product.name} cover watermark />
                        </PourReveal>
                    )}
                </div>
            )}
            {nameStrip && product.name && (
                // Product name written vertically in the outer margin, beside the big photo
                <div
                    className={`pointer-events-none absolute top-0 flex items-center justify-center ${side === 'left' ? 'left-0' : 'right-0'}`}
                    style={{ width: '9%', bottom: '31cqw' }}
                >
                    <h2
                        className="whitespace-nowrap text-[2.1cqw] font-extrabold uppercase leading-none tracking-[0.1em] text-zinc-900"
                        style={{ writingMode: 'vertical-rl', transform: side === 'left' ? 'rotate(180deg)' : 'none', maxHeight: '100%' }}
                    >
                        {product.name}
                    </h2>
                </div>
            )}
            {thumbs.length > 0 && (
                // Title for the colour thumbnails, written vertically in the outer margin
                <div
                    className={`pointer-events-none absolute flex items-center justify-center ${side === 'left' ? 'left-0' : 'right-0'}`}
                    style={{ width: '9%', bottom: '7.5cqw', height: '21cqw' }}
                >
                    <p
                        className="whitespace-nowrap text-[1.6cqw] font-normal uppercase leading-none tracking-[0.08em] text-zinc-600"
                        style={{ writingMode: 'vertical-rl', transform: side === 'left' ? 'rotate(180deg)' : 'none' }}
                    >
                        Available Colors
                    </p>
                </div>
            )}
            {thumbs.length > 0 && (
                <div
                    className="grid shrink-0 grid-cols-4 gap-[1.5cqw] pb-[3cqw] pt-[1.5cqw]"
                    style={{ ...inset, height: '30cqw' }}
                >
                    {thumbs.map((c, i) => (
                        <ColorThumb key={c.id} color={c} index={i} selected={c.id === activeId} exporting={exporting} onPick={pick} />
                    ))}
                </div>
            )}
        </div>
    );
}

function DetailsPage({ view }) {
    const { product, composition, sizes, gallery, features, swatch, isTankTopBundle } = view;

    return (
        <div className="size-full bg-[#f6f6f4]" style={CQ}>
            <div className="flex size-full flex-col pb-[4cqw] pl-[5cqw] pr-[3cqw] pt-[3cqw]">
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

                        {features.length > 0 && <FeatureList features={features} max={4} />}

                        {composition && (
                            <Section title="Product Composition">
                                <p className="line-clamp-4 text-[1.9cqw] leading-snug text-zinc-600">{composition}</p>
                            </Section>
                        )}

                        <SwatchSquare image={swatch} className="w-[33.87cqw]" />
                        <WholesaleNote />
                    </div>

                    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-[1.5cqw]">
                        {!isTankTopBundle ? (
                            <CollageGrid images={gallery.slice(0, 3)} />
                        ) : (
                            <GalleryGrid
                                images={gallery}
                                cols={2}
                                rows={isTankTopBundle ? 2 : 3}
                                fitContent={!isTankTopBundle}
                                aspectRatio="4 / 3"
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ---------- LAYOUT B: full-bleed photo left / editorial right ---------- */

function EditorialPage({ view }) {
    const { product, features, composition, sizes, gallery, swatch } = view;

    return (
        <div className="size-full bg-[#f1ede4]" style={CQ}>
            <div className="flex size-full flex-col px-[4.5cqw] pb-[4cqw] pt-[3.5cqw]">
                <div className="flex min-h-0 flex-[3] gap-[2.5cqw]">
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
                        {features.length > 0 && <FeatureList features={features} />}

                        {/* 6. Composition */}
                        {composition && (
                            <Section title="Product Composition">
                                <p className="line-clamp-3 text-[1.9cqw] leading-snug text-zinc-600">{composition}</p>
                            </Section>
                        )}

                        {/* 4th feature image, bottom of the left column */}
                        {gallery[3] && (
                            <div
                                className="relative mt-auto w-full shrink-0 overflow-hidden rounded-[1.6cqw] bg-[#e6e8e8]"
                                style={{ aspectRatio: '263 / 212' }}
                            >
                                <Photo src={gallery[3]} cover />
                            </div>
                        )}
                        <WholesaleNote className={`!text-[1.6cqw] ${gallery[3] ? '' : 'mt-auto'}`} />
                    </div>

                    <div className="flex min-h-0 flex-1 flex-col items-stretch justify-start gap-[1.5cqw]">
                        <GalleryFan images={gallery} />
                        {/* Swatch fabric moved to the right column, bottom-aligned */}
                        <SwatchSquare image={swatch} className="mt-[4.5cqw] self-end w-[33.87cqw]" />
                    </div>
                </div>

            </div>
        </div>
    );
}

/* ---------- LAYOUT C: info left / showcase right ---------- */

function InfoPage({ view }) {
    const { product, features, composition, sizes, gallery, swatch } = view;

    return (
        <div className="size-full bg-[#fafaf8]" style={CQ}>
            <div className="flex size-full flex-col px-[5cqw] pb-[3cqw] pt-[1.5cqw]">
                <div className="flex min-h-0 flex-1 gap-[2.5cqw]">
                    <div className="flex w-[48%] min-w-0 flex-col gap-[1.8cqw] overflow-hidden">
                        {product.sku && (
                            <Section title="Style Number">
                                <p className="truncate text-[1.9cqw] text-zinc-600">{product.sku}</p>
                            </Section>
                        )}

                        {sizes.length > 0 && (
                            <Section title="Size Variant">
                                <SizeChips sizes={sizes} />
                            </Section>
                        )}

                        {features.length > 0 && <FeatureList features={features} />}

                        {composition && (
                            <Section title="Product Composition">
                                <p className="line-clamp-3 text-[1.9cqw] leading-snug text-zinc-600">{composition}</p>
                            </Section>
                        )}

                        <SwatchSquare image={swatch} className="mt-auto w-[33.87cqw]" />
                        <WholesaleNote />
                    </div>

                    <div className="flex min-h-0 min-w-0 flex-1">
                        <FeatureShowcase images={gallery} />
                    </div>
                </div>
            </div>
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

const HeroPageNameStrip = (props) => <HeroPage {...props} nameStrip />;

const LAYOUTS = [
    { left: HeroPageNameStrip, right: DetailsPage }, // A
    { left: HeroPageNameStrip, right: EditorialPage }, // B
    { left: HeroPageNameStrip, right: InfoPage }, // C
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

    // Get the behind-the-model watermarks ready in the background
    useEffect(() => {
        const srcs = [...new Set(pages.map((pg) => pg.image).filter(Boolean))];
        return prewarmWatermarks(srcs);
    }, [pages]);

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
