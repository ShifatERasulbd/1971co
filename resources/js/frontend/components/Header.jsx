import { useEffect, useMemo, useRef, useState } from 'react';
import { Menu, Search, ShoppingCart, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';

import { getSettingsPayload, onSettingsUpdated } from '../../utils/siteSettings';
import { useCart } from '../context/CartContext';
import { timelessFontClass } from '../utils/typography';

const shopMegaMenuImage = '/uploads/heroes/images/hero1.webp';

const utilityIcons = [
    { label: 'Account', icon: UserRound, href: '/login' },
    { label: 'Search', icon: Search, href: '#search' },
    { label: 'Cart', icon: ShoppingCart, href: '#cart' },
];

export default function Header() {
    const { itemCount, openCartDrawer } = useCart();
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [grandChilds, setGrandChilds] = useState([]);
    const [isNavigationLoading, setIsNavigationLoading] = useState(true);
    const [siteSettings, setSiteSettings] = useState(() => getSettingsPayload());
    const [isShopMegaMenuOpen, setIsShopMegaMenuOpen] = useState(false);
    const closeMenuTimerRef = useRef(null);

    function cancelShopMenuClose() {
        if (closeMenuTimerRef.current) {
            window.clearTimeout(closeMenuTimerRef.current);
            closeMenuTimerRef.current = null;
        }
    }

    function openShopMenu() {
        cancelShopMenuClose();
        setIsShopMegaMenuOpen(true);
    }

    function closeShopMenuWithDelay() {
        cancelShopMenuClose();
        closeMenuTimerRef.current = window.setTimeout(() => {
            setIsShopMegaMenuOpen(false);
        }, 220);
    }

    function closeShopMenuImmediately() {
        cancelShopMenuClose();
        setIsShopMegaMenuOpen(false);
    }

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
                setIsNavigationLoading(true);

                const [
                    categoriesResponse,
                    subCategoriesResponse,
                    grandChildsResponse,
                ] = await Promise.all([
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
            } catch (error) {
                console.error(error);
            } finally {
                if (!ignore) {
                    setIsNavigationLoading(false);
                }
            }
        }

        loadNavigationData();

        return () => {
            ignore = true;
        };
    }, []);

    useEffect(() => () => {
        if (closeMenuTimerRef.current) {
            window.clearTimeout(closeMenuTimerRef.current);
        }
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
                        String(categoryLabel).trim().toLowerCase() === 'shop' ||
                        String(category?.slug || '').trim().toLowerCase() === 'shop',
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
                String(item?.label || '').trim().toLowerCase() === 'shop' ||
                String(item?.slug || '').trim().toLowerCase() === 'shop'
            ) || null,
        [navigationItems]
    );

    const shopChildColumns = useMemo(() => {
        if (!shopNavItem) {
            return [];
        }

        const shopSubCategories = subCategories.filter(
            (subCategory) => Number(subCategory?.category_id) === Number(shopNavItem?.id)
        );

        const grandChildsBySubCategory = grandChilds.reduce((grouped, grandChild) => {
            const subCategoryId = Number(grandChild?.sub_category_id ?? grandChild?.child_id);
            if (!subCategoryId) return grouped;

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

            const children =
                grandChildsBySubCategory
                    .get(Number(subCategory?.id))
                    ?.slice(0, 6)
                    ?.map((grandChild) => ({
                        label: grandChild?.name || 'Item',
                        href: `/shop?category=${encodeURIComponent(
                            shopNavItem?.slug || String(shopNavItem?.id || '')
                        )}&sub_category=${encodeURIComponent(
                            subCategory?.slug || String(subCategory?.id || '')
                        )}&grand_child=${encodeURIComponent(
                            grandChild?.slug || String(grandChild?.id || '')
                        )}`,
                    })) || [];

            return {
                title: subCategory?.name,
                href: childHref,
                items: children,
            };
        });
    }, [shopNavItem, subCategories, grandChilds]);

    const headerLogo = useMemo(() => {
        const raw = typeof siteSettings?.header_logo === 'string' ? siteSettings.header_logo.trim() : '';
        if (!raw) return '';
        if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('/')) {
            return raw;
        }
        return `/${raw.replace(/^\/+/, '')}`;
    }, [siteSettings]);

    return (
        <header className={`${timelessFontClass} site-header sticky top-0 z-50 border-b border-zinc-200 bg-white text-zinc-950 backdrop-blur`}>
            <div className="site-header-inner mx-auto grid h-[90px] w-full max-w-[1920px] grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6 lg:px-10">
                
                {/* Main Navigation Row */}
                <nav className="site-header-nav col-start-1 hidden items-center justify-start gap-8 xl:flex" aria-label="Primary">
                    {isNavigationLoading ? (
                        /* Main Header Links Skeleton state while fetching data */
                        <>
                            <div className="h-4 w-20 animate-pulse rounded bg-zinc-200" />
                            <div className="h-4 w-14 animate-pulse rounded bg-zinc-200" />
                            <div className="h-4 w-16 animate-pulse rounded bg-zinc-200" />
                            <div className="h-4 w-32 animate-pulse rounded bg-zinc-200" />
                        </>
                    ) : (
                        navigationItems.map((item) =>
                            item.isShop ? (
                                <div
                                    key={item.label}
                                    className="relative flex items-center py-4"
                                    onMouseEnter={openShopMenu}
                                    onMouseLeave={closeShopMenuWithDelay}
                                    onFocus={openShopMenu}
                                    onBlur={(event) => {
                                        if (!event.currentTarget.contains(event.relatedTarget)) {
                                            closeShopMenuWithDelay();
                                        }
                                    }}
                                >
                                    <Link
                                        to={item.href}
                                        className="site-header-nav-link text-[0.85rem] font-medium uppercase tracking-[0.22em] text-zinc-950 transition-opacity hover:opacity-60"
                                        aria-expanded={isShopMegaMenuOpen}
                                        aria-haspopup="menu"
                                    >
                                        {item.label}
                                    </Link>

                                    {/* Mega Menu Dropdown */}
                                    <div
                                        className={`fixed left-0 right-0 top-[90px] z-50 w-full overflow-hidden transition-all duration-300 ease-out ${
                                            isShopMegaMenuOpen
                                                ? 'visible max-h-[540px] translate-y-0 opacity-100 pointer-events-auto'
                                                : 'invisible max-h-0 -translate-y-1 opacity-0 pointer-events-none'
                                        }`}
                                        onMouseEnter={openShopMenu}
                                        onMouseLeave={closeShopMenuWithDelay}
                                        role="menu"
                                    >
                                        <div className="border border-zinc-200 bg-white px-4 py-8 shadow-[0_18px_60px_rgba(0,0,0,0.08)] sm:px-6 lg:px-10">
                                            <div className="mx-auto flex w-full max-w-[1920px] items-start gap-8 xl:gap-10">
                                                <div className="min-w-0 flex-1 overflow-x-auto">
                                                    <div className="grid min-w-[720px] grid-flow-col auto-cols-fr gap-8">
                                                        {shopChildColumns.length > 0 ? (
                                                            shopChildColumns.map((column) => (
                                                                <div key={column.title} className="space-y-4">
                                                                    <h3 className="text-[0.72rem] uppercase tracking-[0.18em] text-zinc-400">
                                                                        <Link
                                                                            to={column.href}
                                                                            className="transition-colors hover:text-zinc-700"
                                                                            onClick={closeShopMenuImmediately}
                                                                        >
                                                                            {column.title}
                                                                        </Link>
                                                                    </h3>

                                                                    <ul className="space-y-2 text-[0.88rem] leading-6 text-zinc-600">
                                                                        {column.items.map((megaItem) => (
                                                                            <li key={`${column.title}-${megaItem.label}`}>
                                                                                <Link
                                                                                    to={megaItem.href}
                                                                                    className="transition-colors hover:text-zinc-950"
                                                                                    onClick={closeShopMenuImmediately}
                                                                                >
                                                                                    {megaItem.label}
                                                                                </Link>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="py-6 text-sm text-zinc-500">
                                                                No categories found
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Mega Menu Spotlight Image */}
                                                <div className="flex justify-center">
                                                    <figure className="w-full max-w-[260px] text-center">
                                                        <Link
                                                            to="/shop"
                                                            className="block overflow-hidden bg-zinc-100 p-3"
                                                            onClick={closeShopMenuImmediately}
                                                        >
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
                                    className="site-header-nav-link text-[0.85rem] font-medium uppercase tracking-[0.22em] text-zinc-950 transition-opacity hover:opacity-60"
                                >
                                    {item.label}
                                </Link>
                            ) : (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className="site-header-nav-link text-[0.85rem] font-medium uppercase tracking-[0.22em] text-zinc-950 transition-opacity hover:opacity-60"
                                >
                                    {item.label}
                                </Link>
                            )
                        )
                    )}
                </nav>

                {/* Logo Area */}
                <Link
                    to="/"
                    className="site-header-brand col-start-2 justify-self-center flex min-w-0 items-center transition-opacity hover:opacity-80"
                    aria-label="Home"
                >
                    {headerLogo ? (
                        <img
                            src={headerLogo}
                            alt="Logo"
                            className="site-header-brand-logo h-9 w-auto max-w-[220px] object-contain sm:h-11"
                        />
                    ) : (
                        <div className="h-5 w-36 animate-pulse rounded bg-zinc-200 sm:h-6 sm:w-44" />
                    )}
                </Link>

                {/* Utilities / Right Side Tools */}
                <div className="site-header-tools col-start-3 justify-self-end flex items-center justify-end gap-2 sm:gap-3 xl:gap-8">
                    <div className="hidden items-center gap-1 md:flex">
                        {utilityIcons.map(({ label, icon: Icon, href }) => (
                            label === 'Cart' ? (
                                <button
                                    key={label}
                                    type="button"
                                    aria-label={label}
                                    onClick={openCartDrawer}
                                    className="relative inline-flex size-11 items-center justify-center rounded-full text-zinc-950 transition-colors hover:bg-white/70 hover:text-zinc-700"
                                >
                                    <Icon className="size-5" strokeWidth={1.75} />
                                    {itemCount > 0 ? (
                                        <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-[18px] items-center justify-center rounded-full bg-zinc-900 px-1 text-[10px] font-semibold leading-4 text-white">
                                            {itemCount > 99 ? '99+' : itemCount}
                                        </span>
                                    ) : null}
                                </button>
                            ) : href.startsWith('/') ? (
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