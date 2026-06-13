import { useState } from 'react';

const displayCategories = ['All', 'Men', 'Women', 'Youth', 'Jackets', 'Shirts', 'Sweaters'];
const colorFilters = [
    { label: 'Black', value: '#171717' },
    { label: 'White', value: '#ffffff' },
    { label: 'Navy', value: '#1e3a8a' },
    { label: 'Red', value: '#dc2626' },
    { label: 'Gray', value: '#9ca3af' },
];
const sizeFilters = ['XS', 'S', 'M', 'L', 'XL'];
const priceFilters = ['$0 - $50', '$50 - $100', '$100 - $150', '$150+'];

function FilterChevron({ open = false }) {
    return (
        <svg
            viewBox="0 0 24 24"
            className={`size-5 text-zinc-950 transition-transform ${open ? 'rotate-180' : ''}`}
            aria-hidden="true"
        >
            <path
                d="M6 9l6 6 6-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function SidebarFilterRow({ title, open = false, onToggle, children }) {
    return (
        <div className="border-b border-zinc-200 pb-4">
            <button
                type="button"
                onClick={onToggle}
                aria-expanded={open}
                className="flex w-full items-center justify-between gap-3"
            >
                <span className="text-left text-[0.82rem] font-semibold uppercase tracking-[0.12em] text-zinc-900">
                    {title}
                </span>
                <FilterChevron open={open} />
            </button>

            {open && children ? <div className="pt-4">{children}</div> : null}
        </div>
    );
}

export default function ShopSidebar() {
    const [openSections, setOpenSections] = useState({
        categories: true,
        color: true,
        size: true,
        price: false,
    });

    function toggleSection(sectionKey) {
        setOpenSections((previous) => ({
            ...previous,
            [sectionKey]: !previous[sectionKey],
        }));
    }

    return (
        <aside className="bg-white px-6 py-5 sm:px-8 sm:py-7">
            <div className="mt-8 space-y-9">
                <SidebarFilterRow
                    title="Product Categories"
                    open={openSections.categories}
                    onToggle={() => toggleSection('categories')}
                >
                    <ul className="space-y-2.5 text-[1.05rem] leading-8 text-slate-600 sm:text-[1.08rem]">
                        {displayCategories.map((item, index) => (
                            <li key={item}>
                                <button
                                    type="button"
                                    className={`transition-colors hover:text-zinc-950 ${index === 0 ? 'font-medium text-zinc-950' : ''}`}
                                >
                                    {item}
                                </button>
                            </li>
                        ))}
                    </ul>
                </SidebarFilterRow>

                <SidebarFilterRow
                    title="Filter By Color"
                    open={openSections.color}
                    onToggle={() => toggleSection('color')}
                >
                    <div className="flex flex-wrap gap-2">
                        {colorFilters.map((color) => (
                            <button
                                key={color.label}
                                type="button"
                                aria-label={`Filter by ${color.label}`}
                                className="inline-flex size-8 items-center justify-center rounded-full border border-zinc-300"
                                title={color.label}
                            >
                                <span
                                    className="size-5 rounded-full border border-zinc-300"
                                    style={{ backgroundColor: color.value }}
                                />
                            </button>
                        ))}
                    </div>
                </SidebarFilterRow>

                <SidebarFilterRow
                    title="Filter By Size"
                    open={openSections.size}
                    onToggle={() => toggleSection('size')}
                >
                    <div className="flex flex-wrap gap-2">
                        {sizeFilters.map((size) => (
                            <button
                                key={size}
                                type="button"
                                className="inline-flex min-w-10 items-center justify-center border border-zinc-300 px-2 py-1 text-[0.72rem] font-medium uppercase tracking-[0.08em] text-zinc-700 transition-colors hover:border-zinc-900 hover:text-zinc-950"
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </SidebarFilterRow>

                <SidebarFilterRow
                    title="Filter By Price"
                    open={openSections.price}
                    onToggle={() => toggleSection('price')}
                >
                    <ul className="space-y-2 text-[0.92rem] text-zinc-700">
                        {priceFilters.map((priceRange) => (
                            <li key={priceRange}>
                                <button
                                    type="button"
                                    className="transition-colors hover:text-zinc-950"
                                >
                                    {priceRange}
                                </button>
                            </li>
                        ))}
                    </ul>
                </SidebarFilterRow>
            </div>
        </aside>
    );
}
