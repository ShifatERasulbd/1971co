import { useEffect, useMemo, useState } from 'react';
import { Menu, Search, ShoppingCart, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';

import { getSettingsPayload, onSettingsUpdated } from '../../utils/siteSettings';
import { timelessFontClass } from '../utils/typography';

const fallbackMegaMenuColumns = [
    {
        title: 'Men',
        items: [
            { label: 'Tshirt', href: '/shop' },
            { label: 'Sweatshirt', href: '/shop' },
            { label: 'Hoodie', href: '/shop' },
            { label: 'Full Sleeve t-shirt', href: '/shop' },
        ],
    },
    {
        title: 'Women',
        items: [
            { label: 'Tshirt', href: '/shop' },
            { label: 'Sweatshirt', href: '/shop' },
            { label: 'Hoodie', href: '/shop' },
            { label: 'Full Sleeve t-shirt', href: '/shop' },
        ],
    },
    {
        title: 'Youth',
        items: [
            { label: 'Tshirt', href: '/shop' },
            { label: 'Sweatshirt', href: '/shop' },
            { label: 'Hoodie', href: '/shop' },
            { label: 'Full Sleeve t-shirt', href: '/shop' },
        ],
    },
    {
        title: 'Shop By Event',
        items: [
            { label: 'Corporates', href: '/shop' },
            { label: 'Spirit wear', href: '/shop' },
            { label: 'Education', href: '/shop' },
            { label: 'Sports', href: '/shop' },
        ],
    },
];

const fallbackShopSubCategoryItems = [
    { label: 'Tshirt', href: '/shop' },
    { label: 'Sweatshirt', href: '/shop' },
    { label: 'Hoodie', href: '/shop' },
    { label: 'Full Sleeve t-shirt', href: '/shop' },
];

const fallbackGrandChildItems = [
    { label: 'View all', href: '/shop' },
];

const shopMegaMenuImage = '/uploads/heroes/images/hero1.webp';

const utilityIcons = [
    { label: 'Account', icon: UserRound, href: '/login' },
    { label: 'Search', icon: Search, href: '#search' },
    { label: 'Cart', icon: ShoppingCart, href: '#cart' },
];

export default function Header() {
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [grandChilds, setGrandChilds] = useState([]);
    const [siteSettings, setSiteSettings] = useState(() => getSettingsPayload());

    useEffect(() => {
        const unsubscribe = onSettingsUpdated((payload) => {
            setSiteSettings(payload || {});
        });

        setSiteSettings(getSettingsPayload() || {});

        return unsubscribe;
    }, []);

    useEffect(() => {
        let ignore = false;

        async function loadNavigationData() {
            try {
                const [categoriesResponse, subCategoriesResponse, grandChildsResponse] = await Promise.all([
                    fetch('/api/public/categories', {
                        headers: { Accept: 'application/json' },
                    }),
                    fetch('/api/public/sub-categories', {
                        headers: { Accept: 'application/json' },
                    }),
                    fetch('/api/public/grand-childs', {
                        headers: { Accept: 'application/json' },
                    }),
                ]);

                if (categoriesResponse.ok) {
                    const categoriesPayload = await categoriesResponse.json();
                    if (!ignore && Array.isArray(categoriesPayload)) {
                        setCategories(categoriesPayload);
                    }
                }

                if (subCategoriesResponse.ok) {
                    const subCategoriesPayload = await subCategoriesResponse.json();
                    if (!ignore && Array.isArray(subCategoriesPayload)) {
                        setSubCategories(subCategoriesPayload);
                    }
                }

                if (grandChildsResponse.ok) {
                    const grandChildsPayload = await grandChildsResponse.json();
                    if (!ignore && Array.isArray(grandChildsPayload)) {
                        setGrandChilds(grandChildsPayload);
                    }
                }
            } catch {
                // Keep fallback navigation when the public endpoint is unavailable.
            }
        }

        loadNavigationData();

        return () => {
            ignore = true;
        };
    }, []);

    const visibleCategories = useMemo(() => {
        if (!Array.isArray(categories) || categories.length === 0) {
            return [];
        }

        const homepageCategories = categories.filter((category) =>
            Boolean(category?.show_homepage ?? true)
        );

        return homepageCategories.length > 0 ? homepageCategories : categories;
    }, [categories]);

    const navigationItems = useMemo(() => {
        const categoryItems = visibleCategories.length > 0
            ? visibleCategories.map((category) => {
                const categoryLabel = category?.name || 'Category';
                return {
                    id: category?.id,
                    slug: category?.slug,
                    label: categoryLabel,
                    href: `/shop?category=${encodeURIComponent(category?.slug || String(category?.id || ''))}`,
                    isRoute: true,
                    isShop:
                        String(categoryLabel).trim().toLowerCase() === 'shop'
                        || String(category?.slug || '').trim().toLowerCase() === 'shop',
                };
            })
            : [
                { label: 'Best Sellers', href: '#best-sellers', isRoute: false },
                { label: 'Shop', href: '/shop', isRoute: true, isShop: true },
            ];

        return [
            ...categoryItems,
            { label: 'About', href: '/about', isRoute: true },
            
            { label: 'Together We Grow', href: '#together-we-grow', isRoute: false },
        ];
    }, [visibleCategories]);

    const shopNavItem = useMemo(
        () =>
            navigationItems.find((item) =>
                String(item?.label || '').trim().toLowerCase() === 'shop'
                || String(item?.slug || '').trim().toLowerCase() === 'shop'
            ) || null,
        [navigationItems]
    );

    const shopChildColumns = useMemo(() => {
        if (!shopNavItem) {
            return fallbackShopSubCategoryItems.map((item) => ({
                title: item.label,
                href: item.href,
                items: fallbackGrandChildItems,
            }));
        }

        const shopSubCategories = subCategories.filter(
            (subCategory) => Number(subCategory?.category_id) === Number(shopNavItem?.id)
        );

        if (shopSubCategories.length === 0) {
            return fallbackShopSubCategoryItems.map((item) => ({
                title: item.label,
                href: item.href,
                items: fallbackGrandChildItems,
            }));
        }

        const grandChildsBySubCategory = grandChilds.reduce((grouped, grandChild) => {
            const subCategoryId = Number(grandChild?.sub_category_id ?? grandChild?.child_id);
            if (!subCategoryId) {
                return grouped;
            }

            const existing = grouped.get(subCategoryId) || [];
            existing.push(grandChild);
            grouped.set(subCategoryId, existing);
            return grouped;
        }, new Map());

        return shopSubCategories.map((subCategory) => {
            const childHref = `/shop?category=${encodeURIComponent(
                shopNavItem?.slug || String(shopNavItem?.id || '')
            )}&sub_category=${encodeURIComponent(
                subCategory?.slug || String(subCategory?.id || '')
            )}`;

            const grandChildren = (grandChildsBySubCategory.get(Number(subCategory?.id)) || [])
                .slice(0, 6)
                .map((grandChild) => ({
                    label: grandChild?.name || 'Item',
                    href: `/shop?category=${encodeURIComponent(
                        shopNavItem?.slug || String(shopNavItem?.id || '')
                    )}&sub_category=${encodeURIComponent(
                        subCategory?.slug || String(subCategory?.id || '')
                    )}&grand_child=${encodeURIComponent(grandChild?.slug || String(grandChild?.id || ''))}`,
                }));

            return {
                title: subCategory?.name || 'Sub category',
                href: childHref,
                items: grandChildren.length > 0 ? grandChildren : [{ label: 'View all', href: childHref }],
            };
        });
    }, [shopNavItem, subCategories, grandChilds]);

    const headerLogo = useMemo(() => {
        const raw = typeof siteSettings?.header_logo === 'string' ? siteSettings.header_logo.trim() : '';
        if (!raw) {
            return '';
        }

        if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('/')) {
            return raw;
        }

        return `/${raw.replace(/^\/+/, '')}`;
    }, [siteSettings]);

    return (
        <header className={`${timelessFontClass} sticky top-0 z-50 border-b border-zinc-200 bg-white text-zinc-950 backdrop-blur`}>
            <div className="mx-auto relative flex h-[90px] max-w-[1920px] items-center px-4 sm:px-6 lg:px-10">
                <nav className="hidden items-center justify-start gap-10 xl:flex" aria-label="Primary">
                    {navigationItems.map((item) =>
                        item.isShop ? (
                            <div key={item.label} className="group relative flex items-center py-4">
                                <Link
                                    to={item.href}
                                    className="text-[0.85rem] font-medium uppercase tracking-[0.22em] text-zinc-950 transition-opacity hover:opacity-60"
                                >
                                    {item.label}
                                </Link>

                                <div className="invisible fixed left-0 right-0 top-[78px] z-50 max-h-0 w-full overflow-hidden pt-3 opacity-0 transition-[max-height,opacity] duration-300 ease-out group-hover:visible group-hover:max-h-[540px] group-hover:opacity-100">
                                    <div className="border border-zinc-200 bg-white px-4 py-8 shadow-[0_18px_60px_rgba(0,0,0,0.08)] sm:px-6 lg:px-10">
                                        <div className="mx-auto flex w-full max-w-[1920px] items-start gap-8 xl:gap-10">
                                            <div className="min-w-0 flex-1 overflow-x-auto">
                                                <div className="grid min-w-[720px] grid-flow-col auto-cols-fr gap-8">
                                                    {shopChildColumns.map((column) => (
                                                        <div key={column.title} className="space-y-4">
                                                            <h3 className="text-[0.72rem] uppercase tracking-[0.18em] text-zinc-400">
                                                                <Link to={column.href} className="transition-colors hover:text-zinc-700">
                                                                    {column.title}
                                                                </Link>
                                                            </h3>
                                                            <ul className="space-y-2 text-[0.88rem] leading-6 text-zinc-600">
                                                                {column.items.map((megaItem) => (
                                                                    <li key={`${column.title}-${megaItem.label}`}>
                                                                        <Link
                                                                            to={megaItem.href}
                                                                            className="transition-colors hover:text-zinc-950"
                                                                        >
                                                                            {megaItem.label}
                                                                        </Link>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="flex justify-center">
                                                <figure className="w-full max-w-[260px] text-center">
                                                    <Link to="/shop" className="block overflow-hidden bg-zinc-100 p-3">
                                                        <img
                                                            src={shopMegaMenuImage}
                                                            alt="Future Classics New Arrivals"
                                                            className="h-[256px] w-full object-cover object-center"
                                                        />
                                                    </Link>
                                                    <figcaption className="mt-3 text-[0.7rem] uppercase tracking-[0.08em] text-zinc-500">
                                                        Future Classics New Arrivals
                                                    </figcaption>
                                                </figure>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : item.isRoute ? (
                            <Link
                                key={item.label}
                                to={item.href}
                                className="text-[0.85rem] font-medium uppercase tracking-[0.22em] text-zinc-950 transition-opacity hover:opacity-60"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <a
                                key={item.label}
                                href={item.href}
                                className="text-[0.85rem] font-medium uppercase tracking-[0.22em] text-zinc-950 transition-opacity hover:opacity-60"
                            >
                                {item.label}
                            </a>
                        )
                    )}
                </nav>

                <Link
                    to="/"
                    className="absolute left-1/2 flex min-w-0 -translate-x-1/2 items-center text-[1.65rem] font-black tracking-[0.22em] text-zinc-950 transition-opacity hover:opacity-80 sm:text-[1.9rem]"
                    aria-label="Timeless home"
                >
                    {headerLogo ? (
                        <img
                            src={headerLogo}
                            alt="Timless"
                            className="h-9 w-auto max-w-[220px] object-contain sm:h-11"
                        />
                    ) : (
                        'TIMLESS'
                    )}
                </Link>

                <div className="ml-auto flex items-center gap-2 sm:gap-3 xl:gap-8">
                    <div className="hidden items-center gap-1 md:flex">
                        {utilityIcons.map(({ label, icon: Icon, href }) => (
                            href.startsWith('/') ? (
                                <Link
                                    key={label}
                                    to={href}
                                    aria-label={label}
                                    className="inline-flex size-11 items-center justify-center rounded-full text-zinc-950 transition-colors hover:bg-white/70 hover:text-zinc-700"
                                >
                                    <Icon className="size-5" strokeWidth={1.75} />
                                </Link>
                            ) : (
                                <a
                                    key={label}
                                    href={href}
                                    aria-label={label}
                                    className="inline-flex size-11 items-center justify-center rounded-full text-zinc-950 transition-colors hover:bg-white/70 hover:text-zinc-700"
                                >
                                    <Icon className="size-5" strokeWidth={1.75} />
                                </a>
                            )
                        ))}
                    </div>

                    <button
                        type="button"
                        className="inline-flex size-11 items-center justify-center rounded-full text-zinc-950 transition-colors hover:bg-white/70 md:hidden"
                        aria-label="Open menu"
                    >
                        <Menu className="size-5" strokeWidth={1.75} />
                    </button>
                </div>
            </div>
        </header>
    );
}