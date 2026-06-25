import { useEffect, useMemo, useRef, useState } from 'react';
import { Menu, Search, ShoppingCart, UserRound, X, Plus, UserCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { getSettingsPayload, onSettingsUpdated } from '../../utils/siteSettings';
import { useCart } from '../context/CartContext';
import { timelessFontClass } from '../utils/typography';

function normalizeMediaUrl(value = '') {
    const raw = String(value || '').trim();

    if (!raw) {
        return '';
    }

    if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('/')) {
        return raw;
    }

    return `/${raw.replace(/^\/+/, '')}`;
}

function toSearchSlug(value = '') {
    return String(value || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s-]+/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
}

const utilityIcons = [
    { label: 'Account', icon: UserRound, href: '/login' },
    { label: 'Search', icon: Search, href: '#search' },
    { label: 'Cart', icon: ShoppingCart, href: '#cart' },
];

export default function Header() {
    const navigate = useNavigate();
    const { itemCount, openCartDrawer } = useCart();
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [grandChilds, setGrandChilds] = useState([]);
    const [isNavigationLoading, setIsNavigationLoading] = useState(true);
    const [siteSettings, setSiteSettings] = useState(() => getSettingsPayload());
    const [isShopMegaMenuOpen, setIsShopMegaMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [expandedMobileItems, setExpandedMobileItems] = useState({});
    const [expandedMobileSubItems, setExpandedMobileSubItems] = useState({});
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    
    
    const closeMenuTimerRef = useRef(null);
    const searchInputRef = useRef(null);

    function openMobileMenu() {
        setIsMobileMenuOpen(true);
    }

    function closeMobileMenu() {
        setIsMobileMenuOpen(false);
    }

    function openSearch() {
        closeShopMenuImmediately();
        closeMobileMenu();
        setIsSearchOpen(true);
    }

    function closeSearch() {
        setIsSearchOpen(false);
    }

    function handleSearchSubmit(event) {
        event.preventDefault();

        const normalized = String(searchQuery || '').trim();
        closeSearch();

        if (!normalized) {
            navigate('/shop');
            return;
        }

        const searchSlug = toSearchSlug(normalized);
        if (!searchSlug) {
            navigate('/shop');
            return;
        }

        navigate(`/search/${encodeURIComponent(searchSlug)}`);
    }

    function toggleMobileItem(itemKey) {
        if (!itemKey) {
            return;
        }

        setExpandedMobileItems((previous) => ({
            ...previous,
            [itemKey]: !previous[itemKey],
        }));
    }

    function toggleMobileSubItem(itemKey, subItemKey) {
        if (!itemKey || !subItemKey) {
            return;
        }

        const nestedKey = `${itemKey}:${subItemKey}`;

        setExpandedMobileSubItems((previous) => ({
            ...previous,
            [nestedKey]: !previous[nestedKey],
        }));
    }

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

    function handleOpenCart() {
        // Close menu layers first so cart drawer is always topmost and accessible.
        closeShopMenuImmediately();
        closeMobileMenu();

        if (typeof openCartDrawer === 'function') {
            openCartDrawer();
        }
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

    useEffect(() => {
        if (!isMobileMenuOpen && !isSearchOpen) {
            document.body.style.removeProperty('overflow');
            return;
        }

        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.removeProperty('overflow');
        };
    }, [isMobileMenuOpen, isSearchOpen]);

    useEffect(() => {
        if (!isMobileMenuOpen) {
            setExpandedMobileItems({});
            setExpandedMobileSubItems({});
        }
    }, [isMobileMenuOpen]);

    useEffect(() => {
        if (!isSearchOpen) {
            return;
        }

        const timerId = window.setTimeout(() => {
            searchInputRef.current?.focus();
        }, 20);

        return () => {
            window.clearTimeout(timerId);
        };
    }, [isSearchOpen]);

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
                const categorySlug = String(category?.slug || '').trim().toLowerCase();
                const categoryHref = categorySlug === 'shop'
                    ? '/shop'
                    : categorySlug === 'new-arrivals'
                    ? '/new-arrivals'
                    : categorySlug === 'best-sellers'
                    ? '/best-sellers'
                    : `/shop?category=${encodeURIComponent(category?.slug || String(category?.id || ''))}`;
                return {
                    id: category?.id,
                    slug: category?.slug,
                    label: categoryLabel,
                    href: categoryHref,
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
            { label: 'Together We Grow', href: '/together-we-grow', isRoute: true },
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

    const shopMegaMenuImage = useMemo(
        () => normalizeMediaUrl(siteSettings?.shop_menu_image || ''),
        [siteSettings],
    );

    const shopMegaMenuCaption = 'Shop New Arrivals';

    const shopMegaMenuHref = shopNavItem?.href || '/shop';

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
            const subCategorySlug = String(subCategory?.slug || '').trim() || String(subCategory?.id || '');
            const childHref = `/${encodeURIComponent(subCategorySlug)}`;

            const children =
                grandChildsBySubCategory
                    .get(Number(subCategory?.id))
                    ?.map((grandChild) => ({
                        label: String(grandChild?.name || '').trim() || 'Item',
                        href: `/${encodeURIComponent(subCategorySlug)}/${encodeURIComponent(
                            String(grandChild?.slug || '').trim() || String(grandChild?.id || '')
                        )}`,
                    })) || [];

            return {
                title: subCategory?.name,
                href: childHref,
                items: children,
            };
        });
    }, [shopNavItem, subCategories, grandChilds]);

    const mobileSubCategoriesByItem = useMemo(() => {
        if (!Array.isArray(subCategories) || subCategories.length === 0) {
            return new Map();
        }

        const grandChildsBySubCategory = Array.isArray(grandChilds)
            ? grandChilds.reduce((grouped, grandChild) => {
                const subCategoryId = Number(grandChild?.sub_category_id ?? grandChild?.child_id);
                if (!subCategoryId) {
                    return grouped;
                }

                const existing = grouped.get(subCategoryId) || [];
                existing.push(grandChild);
                grouped.set(subCategoryId, existing);
                return grouped;
            }, new Map())
            : new Map();

        const grouped = new Map();

        navigationItems.forEach((item) => {
            const itemId = Number(item?.id);
            const itemSlug = String(item?.slug || '').trim();
            const itemKey = itemSlug || (itemId ? String(itemId) : '');

            if (!itemKey) {
                return;
            }

            const childItems = subCategories
                .filter((subCategory) => Number(subCategory?.category_id) === itemId)
                .map((subCategory) => {
                    const categoryKey = itemSlug || String(itemId);
                    const subCategoryKey = String(subCategory?.slug || '').trim() || String(subCategory?.id || '');
                    const grandChildItems = (grandChildsBySubCategory.get(Number(subCategory?.id)) || []).map((grandChild) => ({
                        id: grandChild?.id,
                        label: String(grandChild?.name || '').trim() || 'Item',
                        href: `/${encodeURIComponent(subCategoryKey)}/${encodeURIComponent(
                            String(grandChild?.slug || '').trim() || String(grandChild?.id || '')
                        )}`,
                    }));

                    return {
                        id: subCategory?.id,
                        key: subCategoryKey,
                        label: String(subCategory?.name || '').trim() || 'Subcategory',
                        href: `/${encodeURIComponent(subCategoryKey)}`,
                        grandChildItems,
                    };
                });

            if (childItems.length > 0) {
                grouped.set(itemKey, childItems);
            }
        });

        return grouped;
    }, [navigationItems, subCategories, grandChilds]);

    const headerLogo = useMemo(() => {
        const raw = typeof siteSettings?.header_logo === 'string' ? siteSettings.header_logo.trim() : '';
        if (!raw) return '';
        if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('/')) {
            return raw;
        }
        return `/${raw.replace(/^\/+/, '')}`;
    }, [siteSettings]);

    const supportPhone = useMemo(() => {
        return String(
            siteSettings?.phone
            || siteSettings?.phone_number
            || siteSettings?.contact_phone
            || '+1 000-000-0000'
        ).trim();
    }, [siteSettings]);

    return (
        <>
        <header className={`${timelessFontClass} site-header sticky top-0 z-[300] border-b border-zinc-200 bg-white text-zinc-950 backdrop-blur`}>
           <div className="site-header-inner mx-auto flex h-[90px] w-full max-w-[1920px] items-center justify-between px-4 sm:px-6 lg:px-10 xl:grid xl:grid-cols-[1fr_auto_1fr]">
                <div className="flex items-center justify-start xl:col-start-1 xl:hidden">
                    <button
                        type="button"
                        className="inline-flex size-11 items-center justify-center rounded-full text-zinc-950 transition-colors hover:bg-white/70"
                        aria-label="Open menu"
                        aria-expanded={isMobileMenuOpen}
                        aria-controls="mobile-menu-drawer"
                        onClick={openMobileMenu}
                    >
                        <Menu className="size-5" strokeWidth={1.75} />
                    </button>
                </div>
                
                {/* Main Navigation Row */}
                <nav className="site-header-nav col-start-1 hidden items-center justify-start gap-5 xl:flex" aria-label="Primary">
                    {isNavigationLoading ? (
                        /* Main Header Links Skeleton state while fetching data */
                        <>
                            <div className="h-4 w-20 animate-pulse rounded bg-zinc-200" />
                            <div className="h-4 w-14 animate-pulse rounded bg-zinc-200" />
                            <div className="h-4 w-16 animate-pulse rounded bg-zinc-200" />
                            <div className="h-4 w-32 animate-pulse rounded bg-zinc-200" />
                        </>
                    ) : (
                        navigationItems.map((item) => {
                            const navKey = `${String(item?.id ?? '')}-${String(item?.label ?? '')}-${String(item?.href ?? '')}`;

                            return (
                            item.isShop ? (
                                <div
                                    key={navKey}
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
                                        className="site-header-nav-link text-[14px] font-medium uppercase tracking-[0.12em] text-zinc-950 transition-opacity hover:opacity-60"
                                        style={{ fontFamily: 'Montserrat, sans-serif' }}
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

                                                {/* Mega Menu Spotlight Image — only rendered when an image is configured in Settings */}
                                                {shopMegaMenuImage ? (
                                                <div className="flex justify-center">
                                                    <figure className="w-full max-w-[260px] text-center">
                                                        <Link
                                                            to={shopMegaMenuHref}
                                                            className="block overflow-hidden bg-zinc-100 p-3"
                                                            onClick={closeShopMenuImmediately}
                                                        >
                                                            <img
                                                                src={shopMegaMenuImage}
                                                                alt={shopMegaMenuCaption}
                                                                className="h-[256px] w-full object-cover object-center"
                                                            />
                                                        </Link>
                                                        <figcaption className="mt-3 text-[0.7rem] uppercase tracking-[0.08em] text-zinc-500">
                                                            {shopMegaMenuCaption}
                                                        </figcaption>
                                                    </figure>
                                                </div>
                                                ) : null}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : item.isRoute ? (
                                <Link
                                    key={navKey}
                                    to={item.href}
                                    className="site-header-nav-link text-[14px] font-medium uppercase tracking-[0.12em] text-zinc-950 transition-opacity hover:opacity-60"
                                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                                >
                                    {item.label}
                                </Link>
                            ) : (
                                <Link
                                    key={navKey}
                                    href={item.href}
                                    className="site-header-nav-link text-[14px] font-medium uppercase tracking-[0.12em] text-zinc-950 transition-opacity hover:opacity-60"
                                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                                >
                                    {item.label}
                                </Link>
                            )
                            );
                        })
                    )}
                </nav>

                {/* Logo Area */}
                <Link
                    to="/"
                    className="site-header-brand absolute left-1/2 -translate-x-1/2 flex min-w-0 items-center transition-opacity hover:opacity-80 xl:relative xl:left-auto xl:translate-x-0 xl:col-start-2 xl:justify-self-center"
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
                <div className="site-header-tools flex items-center justify-end gap-1 sm:gap-2 xl:col-start-3 xl:justify-self-end xl:gap-8">
                    <div className="hidden items-center gap-1 xl:flex">
                        {utilityIcons.map(({ label, icon: Icon, href }) => (
                            label === 'Cart' ? (
                                <button
                                    key={label}
                                    type="button"
                                    aria-label={label}
                                    onClick={handleOpenCart}
                                    className="relative inline-flex size-11 items-center justify-center rounded-full text-zinc-950 transition-colors hover:bg-white/70 hover:text-zinc-700"
                                >
                                    <Icon className="size-5" strokeWidth={1.75} />
                                    {itemCount > 0 ? (
                                        <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-[18px] items-center justify-center rounded-full bg-zinc-900 px-1 text-[10px] font-semibold leading-4 text-white">
                                            {itemCount > 99 ? '99+' : itemCount}
                                        </span>
                                    ) : null}
                                </button>
                            ) : label === 'Search' ? (
                                <button
                                    key={label}
                                    type="button"
                                    aria-label={label}
                                    onClick={openSearch}
                                    className="inline-flex size-11 items-center justify-center rounded-full text-zinc-950 transition-colors hover:bg-white/70 hover:text-zinc-700"
                                >
                                    <Icon className="size-5" strokeWidth={1.75} />
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

                    <div className="flex items-center gap-1 xl:hidden">
                        <button
                            type="button"
                            aria-label="Search"
                            onClick={openSearch}
                            className="inline-flex size-11 items-center justify-center rounded-full text-zinc-950 transition-colors hover:bg-white/70 hover:text-zinc-700"
                        >
                            <Search className="size-5" strokeWidth={1.75} />
                        </button>

                        <button
                            type="button"
                            aria-label="Cart"
                            onClick={handleOpenCart}
                            className="relative inline-flex size-11 items-center justify-center rounded-full text-zinc-950 transition-colors hover:bg-white/70 hover:text-zinc-700"
                        >
                            <ShoppingCart className="size-5" strokeWidth={1.75} />
                            {itemCount > 0 ? (
                                <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-[18px] items-center justify-center rounded-full bg-zinc-900 px-1 text-[10px] font-semibold leading-4 text-white">
                                    {itemCount > 99 ? '99+' : itemCount}
                                </span>
                            ) : null}
                        </button>
                    </div>
                </div>
            </div>

        </header>

            <div
                className={`fixed inset-0 z-[1200] bg-black/35 transition-opacity duration-200 xl:hidden ${
                    isMobileMenuOpen ? 'visible opacity-100 pointer-events-auto' : 'invisible opacity-0 pointer-events-none'
                }`}
                onClick={closeMobileMenu}
                aria-hidden="true"
            />

            <aside
                id="mobile-menu-drawer"
                className={`font-monstrate fixed inset-y-0 left-0 z-[1210] h-screen w-[88vw] max-w-[380px] bg-[#f4f4f4] shadow-[18px_0_48px_rgba(0,0,0,0.15)] transition-transform duration-300 xl:hidden ${
                    isMobileMenuOpen ? 'translate-x-0 pointer-events-auto' : '-translate-x-full pointer-events-none'
                }`}
                aria-label="Mobile menu"
            >
                <div className="flex h-full flex-col">
                    <div className="flex items-center justify-between border-b border-zinc-200/80 px-4 py-4">
                        <div className="flex items-center gap-3">
                            {headerLogo ? (
                                <img
                                    src={headerLogo}
                                    alt="Logo"
                                    className="h-9 w-auto max-w-[170px] object-contain"
                                />
                            ) : (
                                <p className="text-[0.78rem] font-semibold uppercase tracking-[0.1em] text-zinc-700">Menu</p>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={closeMobileMenu}
                            aria-label="Close menu"
                            className="inline-flex size-9 items-center justify-center rounded-full bg-[#E4B037] text-zinc-900 transition-opacity hover:opacity-90"
                        >
                            <X className="size-4" strokeWidth={2} />
                        </button>
                    </div>

                    <nav className="flex-1 overflow-y-auto px-4 py-5" aria-label="Mobile primary">
                        <ul className="space-y-0 border-t border-zinc-200/80">
                            {navigationItems.map((item) => {
                                const itemId = Number(item?.id);
                                const itemSlug = String(item?.slug || '').trim();
                                const itemKey = itemSlug || (itemId ? String(itemId) : '');
                                const childItems = itemKey ? mobileSubCategoriesByItem.get(itemKey) || [] : [];
                                const hasChildren = childItems.length > 0;
                                const isExpanded = Boolean(itemKey && expandedMobileItems[itemKey]);

                                return (
                                    <li key={`mobile-${item.label}`} className="border-b border-zinc-200/80">
                                        <div className="flex items-center justify-between gap-2 px-1 py-4">
                                            {item.isRoute ? (
                                                <Link
                                                    to={item.href}
                                                    onClick={closeMobileMenu}
                                                    className="min-w-0 flex-1 text-[0.88rem] font-semibold uppercase tracking-[0.04em] text-zinc-900"
                                                >
                                                    <span>{item.label}</span>
                                                </Link>
                                            ) : (
                                                <a
                                                    href={item.href}
                                                    onClick={closeMobileMenu}
                                                    className="min-w-0 flex-1 text-[0.88rem] font-semibold uppercase tracking-[0.04em] text-zinc-900"
                                                >
                                                    <span>{item.label}</span>
                                                </a>
                                            )}

                                            {hasChildren ? (
                                                <button
                                                    type="button"
                                                    onClick={() => toggleMobileItem(itemKey)}
                                                    aria-label={`Toggle ${item.label} subcategories`}
                                                    aria-expanded={isExpanded}
                                                    aria-controls={`mobile-submenu-${itemKey}`}
                                                    className="inline-flex size-8 items-center justify-center rounded-md text-zinc-700 transition-colors hover:bg-zinc-200/70"
                                                >
                                                    <Plus
                                                        className={`size-4 transition-transform duration-200 ${isExpanded ? 'rotate-45' : 'rotate-0'}`}
                                                        strokeWidth={2.1}
                                                    />
                                                </button>
                                            ) : null}
                                        </div>

                                        {hasChildren && isExpanded ? (
                                            <ul id={`mobile-submenu-${itemKey}`} className="pb-3 pl-3 pr-1">
                                                {childItems.map((child) => {
                                                    const subItemKey = String(child?.key || child?.id || '');
                                                    const grandChildItems = Array.isArray(child?.grandChildItems) ? child.grandChildItems : [];
                                                    const hasGrandChilds = grandChildItems.length > 0;
                                                    const nestedKey = `${itemKey}:${subItemKey}`;
                                                    const isSubExpanded = Boolean(subItemKey && expandedMobileSubItems[nestedKey]);

                                                    return (
                                                        <li key={`mobile-submenu-${itemKey}-${child.id}`}>
                                                            <div className="flex items-center justify-between gap-2 py-2 pr-1">
                                                                <Link
                                                                    to={child.href}
                                                                    onClick={closeMobileMenu}
                                                                    className="min-w-0 flex-1 text-[0.8rem] font-medium uppercase tracking-[0.03em] text-zinc-700"
                                                                >
                                                                    {child.label}
                                                                </Link>

                                                                {hasGrandChilds ? (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => toggleMobileSubItem(itemKey, subItemKey)}
                                                                        aria-label={`Toggle ${child.label} items`}
                                                                        aria-expanded={isSubExpanded}
                                                                        aria-controls={`mobile-submenu-${itemKey}-${subItemKey}`}
                                                                        className="inline-flex size-7 items-center justify-center rounded-md text-zinc-700 transition-colors hover:bg-zinc-200/70"
                                                                    >
                                                                        <Plus
                                                                            className={`size-3.5 transition-transform duration-200 ${isSubExpanded ? 'rotate-45' : 'rotate-0'}`}
                                                                            strokeWidth={2.1}
                                                                        />
                                                                    </button>
                                                                ) : null}
                                                            </div>

                                                            {hasGrandChilds && isSubExpanded ? (
                                                                <ul id={`mobile-submenu-${itemKey}-${subItemKey}`} className="pb-1 pl-3">
                                                                    {grandChildItems.map((grandChild) => (
                                                                        <li key={`mobile-grand-child-${itemKey}-${subItemKey}-${grandChild.id}`}>
                                                                            <Link
                                                                                to={grandChild.href}
                                                                                onClick={closeMobileMenu}
                                                                                className="block py-1.5 text-[0.74rem] font-medium uppercase tracking-[0.03em] text-zinc-600"
                                                                            >
                                                                                {grandChild.label}
                                                                            </Link>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            ) : null}
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        ) : null}
                                    </li>
                                );
                            })}
                        </ul>

                        <div className="mt-7 border-t border-zinc-200/80 pt-6">
                            <Link
                                to="/login"
                                onClick={closeMobileMenu}
                                className="inline-flex items-center gap-2 text-[0.88rem] font-medium uppercase tracking-[0.03em] text-zinc-800"
                            >
                                <UserCircle2 className="size-4" strokeWidth={1.8} />
                                Register/ Login
                            </Link>

                            <button
                                type="button"
                                onClick={handleOpenCart}
                                className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-md bg-[#E4B037] px-4 text-[0.86rem] font-semibold uppercase tracking-[0.04em] text-zinc-950"
                            >
                                View Cart {itemCount > 0 ? `(${itemCount})` : ''}
                            </button>
                        </div>

                        <div className="mt-7 border-t border-zinc-200/80 pt-6">
                            <p className="text-[0.84rem] text-zinc-500">To More Inquiry</p>
                            <a href={`tel:${supportPhone}`} className="mt-1 block text-[1.65rem] font-semibold leading-tight text-zinc-900">
                                {supportPhone}
                            </a>
                        </div>
                    </nav>
                </div>
            </aside>

            <div
                className={`fixed inset-0 z-[1400] bg-black/40 transition-opacity duration-200 ${
                    isSearchOpen ? 'visible opacity-100 pointer-events-auto' : 'invisible opacity-0 pointer-events-none'
                }`}
                onClick={closeSearch}
                aria-hidden="true"
            />

            <div
                className={`fixed left-1/2 top-[96px] z-[1410] w-[calc(100vw-2rem)] max-w-[720px] -translate-x-1/2 rounded-xl border border-zinc-200 bg-white p-4 shadow-[0_28px_80px_rgba(0,0,0,0.25)] transition-all duration-200 ${
                    isSearchOpen
                        ? 'visible translate-y-0 opacity-100 pointer-events-auto'
                        : 'invisible -translate-y-2 opacity-0 pointer-events-none'
                }`}
                role="dialog"
                aria-label="Search products"
                onKeyDown={(event) => {
                    if (event.key === 'Escape') {
                        closeSearch();
                    }
                }}
            >
                <form className="flex items-center gap-2" onSubmit={handleSearchSubmit}>
                    <Search className="size-5 text-zinc-500" strokeWidth={1.75} />
                    <input
                        ref={searchInputRef}
                        type="search"
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        placeholder="Search products by name, category, or keyword"
                        className="h-11 min-w-0 flex-1 rounded-md border border-zinc-300 px-3 text-[0.95rem] text-zinc-900 outline-none ring-0 placeholder:text-zinc-400 focus:border-zinc-500"
                    />
                    <button
                        type="submit"
                        className="inline-flex h-11 items-center justify-center rounded-md bg-zinc-900 px-4 text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-white"
                    >
                        Search
                    </button>
                    <button
                        type="button"
                        onClick={closeSearch}
                        aria-label="Close search"
                        className="inline-flex size-11 items-center justify-center rounded-md border border-zinc-200 text-zinc-700 transition-colors hover:bg-zinc-100"
                    >
                        <X className="size-4" strokeWidth={2} />
                    </button>
                </form>
            </div>
        </>
    );
}