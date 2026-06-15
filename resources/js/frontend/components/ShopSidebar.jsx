import { useMemo, useState } from 'react';

const availabilityFilters = ['In stock', 'Out of stock'];
const sizeFilters = ['Small (S)', 'Medium (M)', 'Large (L)', 'Extra large (XL)', 'Double extra large (XXL)'];
const categoryFilters = [
    'Coats & Jackets',
    'Hoodies',
    'Joggers',
    "Men's Undershirts",
    'Outerwear',
    'Polos',
    'Shirts',
    'Shorts',
    'Sweatshirts',
    'T-Shirts',
    'Tank Tops',
    'Vests',
];

function FilterChevron({ open = false }) {
    return (
        <svg
            viewBox="0 0 24 24"
            className={`size-4 text-zinc-500 transition-transform ${open ? 'rotate-180' : ''}`}
            aria-hidden="true"
        >
            <path
                d="M6 9l6 6 6-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
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
                <span className="text-left text-[1rem] font-medium uppercase tracking-[0.01em] text-zinc-700">
                    {title}
                </span>
                <FilterChevron open={open} />
            </button>

            {open && children ? <div className="pt-4">{children}</div> : null}
        </div>
    );
}

function CheckboxFilterList({ values, checkedValues, onToggle }) {
    return (
        <ul className="space-y-2 text-[0.8rem] text-zinc-600">
            {values.map((value) => {
                const checked = checkedValues.includes(value);
                return (
                    <li key={value}>
                        <label className="flex cursor-pointer items-center gap-2.5">
                            <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => onToggle(value)}
                                className="size-4 rounded border-zinc-300 text-zinc-900"
                            />
                            <span>{value}</span>
                        </label>
                    </li>
                );
            })}
        </ul>
    );
}

export default function ShopSidebar() {
    const [openSections, setOpenSections] = useState({
        availability: true,
        price: true,
        size: true,
        categories: true,
    });
    const [selectedAvailability, setSelectedAvailability] = useState([]);
    const [selectedSizes, setSelectedSizes] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [showAllCategories, setShowAllCategories] = useState(true);
    const [minPrice, setMinPrice] = useState('0');
    const [maxPrice, setMaxPrice] = useState('59.99');

    const visibleCategories = useMemo(() => {
        if (showAllCategories) {
            return categoryFilters;
        }

        return categoryFilters.slice(0, 8);
    }, [showAllCategories]);

    function toggleSection(sectionKey) {
        setOpenSections((previous) => ({
            ...previous,
            [sectionKey]: !previous[sectionKey],
        }));
    }

    function toggleCheckedValue(setter, value) {
        setter((previous) =>
            previous.includes(value)
                ? previous.filter((item) => item !== value)
                : [...previous, value],
        );
    }

    return (
        <aside className="bg-zinc-100 px-6 py-7 sm:px-7 sm:py-8">
            <div className="space-y-6">
                <h2 className="text-[1.5rem] font-semibold uppercase tracking-[0.03em] text-zinc-800">Filters</h2>

                <SidebarFilterRow
                    title="Availability"
                    open={openSections.availability}
                    onToggle={() => toggleSection('availability')}
                >
                    <CheckboxFilterList
                        values={availabilityFilters}
                        checkedValues={selectedAvailability}
                        onToggle={(value) => toggleCheckedValue(setSelectedAvailability, value)}
                    />
                </SidebarFilterRow>

                <SidebarFilterRow
                    title="Price"
                    open={openSections.price}
                    onToggle={() => toggleSection('price')}
                >
                    <div className="space-y-3">
                        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2.5">
                            <label className="relative block">
                                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[1.35rem] text-zinc-500">$</span>
                                <input
                                    type="text"
                                    value={minPrice}
                                    onChange={(event) => setMinPrice(event.target.value)}
                                    className="h-10 w-full rounded border border-zinc-300 bg-white pl-7 pr-2 text-[1.35rem] text-zinc-700"
                                />
                            </label>

                            <span className="text-[1.25rem] text-zinc-500">to</span>

                            <label className="relative block">
                                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[1.35rem] text-zinc-500">$</span>
                                <input
                                    type="text"
                                    value={maxPrice}
                                    onChange={(event) => setMaxPrice(event.target.value)}
                                    className="h-10 w-full rounded border border-zinc-300 bg-white pl-7 pr-2 text-[1.35rem] text-zinc-700"
                                />
                            </label>
                        </div>

                        <p className="text-[1.3rem] text-zinc-500">The highest price is $59.99</p>
                    </div>
                </SidebarFilterRow>

                <SidebarFilterRow
                    title="Size"
                    open={openSections.size}
                    onToggle={() => toggleSection('size')}
                >
                    <CheckboxFilterList
                        values={sizeFilters}
                        checkedValues={selectedSizes}
                        onToggle={(value) => toggleCheckedValue(setSelectedSizes, value)}
                    />
                </SidebarFilterRow>

                <SidebarFilterRow
                    title="Category"
                    open={openSections.categories}
                    onToggle={() => toggleSection('categories')}
                >
                    <div className="space-y-3">
                        <CheckboxFilterList
                            values={visibleCategories}
                            checkedValues={selectedCategories}
                            onToggle={(value) => toggleCheckedValue(setSelectedCategories, value)}
                        />

                        <button
                            type="button"
                            onClick={() => setShowAllCategories((previous) => !previous)}
                            className="inline-flex items-center gap-2 text-[1.35rem] text-zinc-600 transition-colors hover:text-zinc-900"
                        >
                            <span className="text-[1.1rem]">{showAllCategories ? '-' : '+'}</span>
                            {showAllCategories ? 'Show less' : 'Show more'}
                        </button>
                    </div>
                </SidebarFilterRow>
            </div>
        </aside>
    );
}
