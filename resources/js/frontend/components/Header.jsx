import { Menu, Search, ShoppingCart, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';

import { timelessFontClass } from '../../utils/typography';

const navigationItems = [
    { label: 'Best Sellers', href: '#best-sellers' },
    { label: 'Shop', href: '/shop' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
];

const shopMegaMenuColumns = [
    {
        title: 'Men',
        items: ['Tshirt', 'Sweatshirt', 'Hoodie', 'Full Sleeve t-shirt'],
    },
    {
        title: 'Women',
        items: ['Tshirt', 'Sweatshirt', 'Hoodie', 'Full Sleeve t-shirt'],
    },
    {
        title: 'Youth',
        items: ['Tshirt', 'Sweatshirt', 'Hoodie', 'Full Sleeve t-shirt'],
    },
    {
        title: 'Shop By Event',
        items: ['Corporates', 'Spirit wear', 'Education', 'Sports'],
    },
];

const shopMegaMenuImage = '/uploads/heroes/images/hero1.webp';

const utilityIcons = [
    { label: 'Account', icon: UserRound, href: '/login' },
    { label: 'Search', icon: Search, href: '#search' },
    { label: 'Cart', icon: ShoppingCart, href: '#cart' },
];

export default function Header() {
    return (
        <header className={`${timelessFontClass} sticky top-0 z-50 border-b border-zinc-200 bg-white text-zinc-950 backdrop-blur`}>
            <div className="mx-auto relative flex h-[90px] max-w-[1920px] items-center px-4 sm:px-6 lg:px-10">
                <nav className="hidden items-center justify-start gap-10 xl:flex" aria-label="Primary">
                    {navigationItems.map((item) =>
                        item.label === 'Shop' ? (
                            <div key={item.label} className="group relative flex items-center py-4">
                                <Link
                                    to={item.href}
                                    className="text-[0.85rem] font-medium uppercase tracking-[0.22em] text-zinc-950 transition-opacity hover:opacity-60"
                                >
                                    {item.label}
                                </Link>

                                <div className="invisible fixed left-0 right-0 top-[78px] z-50 max-h-0 w-full overflow-hidden pt-3 opacity-0 transition-[max-height,opacity] duration-300 ease-out group-hover:visible group-hover:max-h-[540px] group-hover:opacity-100">
                                    <div className="border border-zinc-200 bg-white px-4 py-8 shadow-[0_18px_60px_rgba(0,0,0,0.08)] sm:px-6 lg:px-10">
                                        <div className="mx-auto grid w-full max-w-[1920px] grid-cols-[1.15fr_1.15fr_1.15fr_1.15fr_1.1fr] gap-8 xl:gap-10">
                                            {shopMegaMenuColumns.map((column) => (
                                                <div key={column.title} className="space-y-4">
                                                    <h3 className="text-[0.72rem] uppercase tracking-[0.18em] text-zinc-400">
                                                        {column.title}
                                                    </h3>
                                                    <ul className="space-y-2 text-[0.88rem] leading-6 text-zinc-600">
                                                        {column.items.map((itemLabel) => (
                                                            <li key={itemLabel}>
                                                                <Link
                                                                    to="/shop"
                                                                    className="transition-colors hover:text-zinc-950"
                                                                >
                                                                    {itemLabel}
                                                                </Link>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}

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
                        ) : item.href.startsWith('/') ? (
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
                    TIMLESS
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