import { useEffect, useMemo, useRef, useState } from 'react';

import { requestJson } from '@/lib/apiClient';

const COVER = '/uploads/catelog/coverPhoto.jpeg';

const PRODUCTS_ENDPOINT = '/api/public/shop-products';
const COLORS_ENDPOINT = '/api/public/colors';
const SIZES_ENDPOINT = '/api/public/sizes';

const BRAND_TEXT = '1971CO.';

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

// Cover photo (1282 x 822) with 115px hidden on the left
const COVER_SCENE_STYLE = {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    aspectRatio: '1282 / 822',
    transform: `translateX(-${(115 / 1282) * 100}%)`,
};

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

/* ---------- DATA ---------- */

async function fetchList(url) {
    try {
        const payload = await requestJson(url);
        if (Array.isArray(payload)) return payload;
        if (Array.isArray(payload?.data)) return payload.data;
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

// Everything a spread needs, prepared once per product
function buildView(p, colorMap, sizeMap) {
    const variantImages = toObject(p.color_variant_images);
    const isBundle = [p.name, p.sku].some((value) => String(value || '').toLowerCase().includes('bundle'));

    const colors = splitIds(p.color).map((id) => {
        const c = colorMap[id];
        const name = c?.name || id;
        const images = toArray(variantImages[id] ?? variantImages[name]);
        return { id, name, hex: c?.hex || '', image: (isBundle ? images[1] : images[0]) || images[0] || '' };
    });

    const sizeIds = [
        ...new Set([...splitIds(p.size), ...toArray(p.variant_rows).flatMap((r) => splitIds(r?.size))]),
    ];
    const sizes = sizeIds.map((id) => sizeMap[id]?.name).filter(Boolean);

    const features = toArray(p.product_features)
        .map((f) => (typeof f === 'string' ? f : f?.title || f?.name || f?.label || ''))
        .filter(Boolean)
        .slice(0, 6);

    const gallery = toArray(p.image_gallery).slice(0, 6);
    if (gallery.length === 0 && p.cover_image) gallery.push(p.cover_image);

    return {
        product: p,
        image: p.cover_image || gallery[0] || '',
        tagline: stripHtml(p.description),
        composition: stripHtml(p.product_composition) || stripHtml(p.fabric_and_care),
        features,
        sizes,
        colors,
        gallery,
    };
}

// Index 0 = closed book (cover on the right). Then one spread per product,
// cycling through the layouts (A, B, C, A, B, C ...).
function buildPages(products, colorMap, sizeMap) {
    return [
        { src: COVER, single: true },
        ...products.map((p, i) => ({ ...buildView(p, colorMap, sizeMap), layout: i % LAYOUTS.length })),
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
                loading={blur ? undefined : 'lazy'}
                draggable={false}
                className="relative size-full object-contain"
            />
        </div>
    );
}

function Section({ title, children }) {
    return (
        <div className="border-b border-zinc-300 pb-[2cqw]">
            <p className="text-[1.8cqw] font-semibold uppercase tracking-[0.1em] text-zinc-500">{title}</p>
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
        <p className={`text-[2cqw] leading-snug text-zinc-600 ${className}`}>
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



function GalleryGrid({ images, cols, rows }) {
    return (
        <div
            className="grid min-h-0 min-w-0 flex-1 gap-[1.2cqw]"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))` }}
        >
            {images.slice(0, cols * rows).map((src, i) => (
                <Photo key={`${src}-${i}`} src={src} />
            ))}
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
                    <p className="mt-[1cqw] truncate text-[1.9cqw] text-zinc-600">{c.name}</p>
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

/* ---------- LAYOUT A: hero left / details right ---------- */

function HeroPage({ view }) {
    const { product, image, tagline, features } = view;

    return (
        <div className="relative size-full overflow-hidden" style={{ ...CQ, background: 'linear-gradient(135deg, #f5f5f4 0%, #d9d9dc 100%)' }}>
            <div className="relative z-10 px-[6cqw] pt-[6cqw]">
                <h2 className="line-clamp-2 text-[6cqw] font-extrabold uppercase leading-[1.08] tracking-tight text-zinc-900">{product.name}</h2>
                {tagline && (
                    <p className="mt-[2cqw] line-clamp-2 max-w-[85%] text-[2.2cqw] uppercase tracking-[0.06em] text-zinc-500">{tagline}</p>
                )}
                {features.length > 0 && (
                    <ul className="mt-[2cqw] flex flex-wrap gap-x-[3cqw] gap-y-[0.6cqw]">
                        {features.slice(0, 4).map((f) => (
                            <li key={f} className="text-[1.9cqw] uppercase tracking-wider text-zinc-700">· {f}</li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Vertical brand strip */}
            <div className="pointer-events-none absolute bottom-[10%] left-[1.5%] top-[34%] z-10 flex w-[6%] items-center justify-center" aria-hidden="true">
                <span className="whitespace-nowrap text-[3.4cqw] font-black tracking-[0.5em] text-zinc-800" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                    {BRAND_TEXT}
                </span>
            </div>

            {image && (
                <div className="absolute" style={{ left: '9%', top: '29%', width: '85%', height: '66.5%' }}>
                    <Photo src={image} alt={product.name} blur />
                </div>
            )}
        </div>
    );
}

function DetailsPage({ view }) {
    const { product, composition, sizes, colors, gallery } = view;

    return (
        <div className="size-full bg-[#f6f6f4]" style={CQ}>
            <div className="flex size-full flex-col pb-[4cqw] pl-[5cqw] pr-[3cqw] pt-[5cqw]">
                <div className="flex min-h-0 flex-[3] gap-[3cqw]">
                    <div className="flex w-[38%] min-w-0 flex-col gap-[2cqw] overflow-hidden">
                        {composition && (
                            <Section title="Product Composition">
                                <p className="line-clamp-4 text-[2.1cqw] leading-snug text-zinc-600">{composition}</p>
                            </Section>
                        )}
                        {product.sku && (
                            <Section title="Style">
                                <p className="truncate text-[2.1cqw] text-zinc-600">{product.sku}</p>
                            </Section>
                        )}
                        {sizes.length > 0 && (
                            <Section title="Size Variant">
                                <SizeChips sizes={sizes} />
                            </Section>
                        )}

                        <WholesaleNote />

                     
                    </div>

                    <GalleryGrid images={gallery} cols={2} rows={3} />
                </div>

                {colors.length > 0 && (
                    <div className="mt-[3cqw] flex min-h-0 flex-[1.3] flex-col">
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
            {colors[0] && (
                <span className="absolute bottom-[3cqw] left-[3cqw] bg-[#3f6b73]/90 px-[2cqw] py-[1cqw] text-[1.8cqw] uppercase tracking-[0.1em] text-white">
                    {colors[0].name}
                </span>
            )}
        </div>
    );
}

function EditorialPage({ view }) {
    const { product, tagline, features, composition, sizes, colors, gallery } = view;

    return (
        <div className="size-full bg-[#f1ede4]" style={CQ}>
            <div className="flex size-full flex-col px-[4.5cqw] pb-[4cqw] pt-[3.5cqw]">
                <div className="flex items-center justify-between text-[1.7cqw] uppercase tracking-[0.1em] text-zinc-500">
                    <span>{BRAND_TEXT}</span>
                    {product.sku && <span>Style {product.sku}</span>}
                </div>

                <h2 className="mt-[1.5cqw] line-clamp-2 text-[5cqw] font-extrabold uppercase leading-[1.08] tracking-tight text-zinc-900">{product.name}</h2>
                {tagline && <p className="mt-[1.5cqw] line-clamp-2 text-[1.8cqw] uppercase tracking-[0.06em] text-zinc-500">{tagline}</p>}

                {features.length > 0 && (
                    <ul className="mt-[2.5cqw] grid grid-cols-3 gap-x-[2cqw] gap-y-[1.4cqw] border-y border-zinc-300 py-[2cqw]">
                        {features.map((f) => (
                            <li key={f} className="flex min-w-0 items-center gap-[1cqw] text-[1.8cqw] text-zinc-700">
                                <CheckIcon className="size-[2.6cqw] shrink-0" />
                                <span className="truncate">{f}</span>
                            </li>
                        ))}
                    </ul>
                )}

                <div className="mt-[2.5cqw] flex min-h-0 flex-[3] gap-[2.5cqw]">
                    <div className="flex w-[40%] min-w-0 flex-col gap-[1.8cqw] overflow-hidden">
                        {composition && (
                            <Section title="Product Composition">
                                <p className="line-clamp-3 text-[1.9cqw] leading-snug text-zinc-600">{composition}</p>
                            </Section>
                        )}
                        {sizes.length > 0 && (
                            <Section title="Size Variant">
                                <SizeChips sizes={sizes} />
                            </Section>
                        )}

                        <WholesaleNote />

                        
                    </div>

                    <GalleryGrid images={gallery} cols={3} rows={2} />
                </div>

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
    const { product, tagline, features, composition, sizes, colors } = view;

    return (
        <div className="size-full bg-[#fafaf8]" style={CQ}>
            <div className="flex size-full flex-col px-[5cqw] pb-[4cqw] pt-[5cqw]">
                <div className="flex items-center justify-between text-[1.7cqw] uppercase tracking-[0.1em] text-zinc-500">
                    <span>{BRAND_TEXT}</span>
                    {product.sku && <span>{product.sku}</span>}
                </div>

                <h2 className="mt-[2cqw] line-clamp-3 text-[5.5cqw] font-extrabold uppercase leading-[1.08] tracking-tight text-zinc-900">{product.name}</h2>
                {tagline && <p className="mt-[2cqw] line-clamp-3 max-w-[90%] text-[2cqw] leading-snug text-zinc-500">{tagline}</p>}

                {features.length > 0 && (
                    <ul className="mt-[2.5cqw] grid grid-cols-2 gap-x-[2cqw] gap-y-[1.2cqw]">
                        {features.slice(0, 4).map((f) => (
                            <li key={f} className="flex min-w-0 items-center gap-[1cqw] text-[1.9cqw] text-zinc-700">
                                <CheckIcon className="size-[2.6cqw] shrink-0" />
                                <span className="truncate">{f}</span>
                            </li>
                        ))}
                    </ul>
                )}

                <div className="mt-[3cqw] grid grid-cols-2 gap-x-[3cqw] gap-y-[2cqw]">
                    {composition && (
                        <div className="col-span-2">
                            <Section title="Product Composition">
                                <p className="line-clamp-3 text-[2cqw] leading-snug text-zinc-600">{composition}</p>
                            </Section>
                        </div>
                    )}
                    {sizes.length > 0 && (
                        <Section title="Size Variant">
                            <SizeChips sizes={sizes} />
                        </Section>
                    )}
                </div>

                <WholesaleNote className="mt-[3cqw]" />

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
        <div className="size-full bg-[#ecebe7]" style={CQ}>
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
        return (
            <div
                className="size-full"
                style={{ backgroundImage: `url(${page.src})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            />
        );
    }
    const Page = LAYOUTS[page.layout]?.[side];
    return Page ? <Page view={page} /> : null;
}

/* ---------- MAIN ---------- */

export default function Catelog() {
    const [stage, setStage] = useState('cover'); // cover | book
    const [page, setPage] = useState(0);
    const [flip, setFlip] = useState(null); // { dir: 'next' | 'prev', go: boolean }
    const [products, setProducts] = useState([]);
    const [colorMap, setColorMap] = useState({});
    const [sizeMap, setSizeMap] = useState({});
    const [loading, setLoading] = useState(true);

    const pages = useMemo(() => buildPages(products, colorMap, sizeMap), [products, colorMap, sizeMap]);
    const last = pages.length - 1;

    const timers = useRef([]);
    const pageRef = useRef(0);
    const pagesRef = useRef(pages);
    pagesRef.current = pages;
    const busy = useRef(false);
    const lastWheel = useRef(0);
    const sectionRef = useRef(null);

    const after = (ms, fn) => timers.current.push(setTimeout(fn, ms));
    const clearTimers = () => {
        timers.current.forEach(clearTimeout);
        timers.current = [];
    };
    useEffect(() => clearTimers, []);

    // Load products + colour/size names
    useEffect(() => {
        let ignore = false;
        Promise.all([fetchList(PRODUCTS_ENDPOINT), fetchList(COLORS_ENDPOINT), fetchList(SIZES_ENDPOINT)])
            .then(([prods, colors, sizes]) => {
                if (ignore) return;
                setProducts(prods);
                setColorMap(toMap(colors));
                setSizeMap(toMap(sizes));
            })
            .finally(() => {
                if (!ignore) setLoading(false);
            });
        return () => {
            ignore = true;
        };
    }, []);

    const setP = (n) => {
        pageRef.current = n;
        setPage(n);
    };

    const turn = (dir) => {
        const p = pageRef.current;
        const lastIndex = pagesRef.current.length - 1;
        if (busy.current) return;
        if (dir === 'next' && p >= lastIndex) return;
        if (dir === 'prev' && p <= 0) return;
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
        setP(0);
        setStage('book');
        after(400, () => turn('next')); // open the cover
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
    }, [stage]);

    // Mouse wheel / trackpad scroll
    useEffect(() => {
        if (stage !== 'book') return;
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
    }, [stage]);

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

    return (
        <section
            ref={sectionRef}
            className="catalog-font relative flex min-h-[calc(100vh-90px)] items-center justify-center overflow-hidden bg-[#333] px-14 py-8 sm:px-20"
        >
            <style>{FONT_CSS}</style>

            {/* ---------- COVER ---------- */}
            {stage === 'cover' && (
                <div className="w-full max-w-[406px] bg-gradient-to-b from-white to-zinc-400 p-[18px] shadow-2xl">
                    <div className="relative aspect-[372/445] overflow-hidden rounded-bl-[56px] rounded-br-sm rounded-tl-sm rounded-tr-[56px] bg-slate-700">
                        <div style={COVER_SCENE_STYLE}>
                            <img src={COVER} alt="1971Co. factory" draggable={false} className="block size-full select-none" />
                        </div>

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

            {/* ---------- BOOK WITH PAGE FLIP ---------- */}
            {stage === 'book' && (
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