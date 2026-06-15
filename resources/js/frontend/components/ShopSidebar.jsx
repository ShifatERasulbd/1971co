import { useMemo, useState } from 'react';

const availabilityFilters = ['In stock', 'Out of stock'];

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
                const key = typeof value === 'object' ? String(value.id) : String(value);
                const label = typeof value === 'object' ? String(value.name || '') : String(value);
                const checked = checkedValues.includes(key);
                return (
                    <li key={key}>
                        <label className="flex cursor-pointer items-center gap-2.5">
                            <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => onToggle(key)}
                                className="size-4 rounded border-zinc-300 text-zinc-900"
                            />
                            <span>{label}</span>
                        </label>
                    </li>
                );
            })}
        </ul>
    );
}

export default function ShopSidebar({
    sizeOptions = [],
    categoryOptions = [],
    selectedAvailability = [],
    selectedSizes = [],
    selectedCategories = [],
    minPrice = '',
    maxPrice = '',
    highestPrice = '',
    onToggleAvailability,
    onToggleSize,
    onToggleCategory,
    onMinPriceChange,
    onMaxPriceChange,
}) {
    const [openSections, setOpenSections] = useState({
        availability: true,
        price: true,
        size: true,
        categories: true,
    });
    const [showAllCategories, setShowAllCategories] = useState(true);

    const visibleCategories = useMemo(() => {
        if (showAllCategories) {
            return categoryOptions;
        }

        return categoryOptions.slice(0, 8);
    }, [showAllCategories, categoryOptions]);

    function toggleSection(sectionKey) {
        setOpenSections((previous) => ({
            ...previous,
            [sectionKey]: !previous[sectionKey],
        }));
    }

    return (
        <aside className="px-6 py-7 sm:px-7 sm:py-8">
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
                        onToggle={onToggleAvailability}
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
                                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[0.8rem] text-zinc-500">$</span>
                                <input
                                    type="text"
                                    value={minPrice}
                                    onChange={(event) => onMinPriceChange?.(event.target.value)}
                                    className="h-9 w-full rounded border border-zinc-300 bg-white pl-6 pr-2 text-[0.8rem] text-zinc-700"
                                />
                            </label>

                            <span className="text-[0.8rem] text-zinc-500">to</span>

                            <label className="relative block">
                                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[0.8rem] text-zinc-500">$</span>
                                <input
                                    type="text"
                                    value={maxPrice}
                                    onChange={(event) => onMaxPriceChange?.(event.target.value)}
                                    className="h-9 w-full rounded border border-zinc-300 bg-white pl-6 pr-2 text-[0.8rem] text-zinc-700"
                                />
                            </label>
                        </div>

                        <p className="text-[0.8rem] text-zinc-500">The highest price is ${highestPrice || '0.00'}</p>
                    </div>
                </SidebarFilterRow>

                <SidebarFilterRow
                    title="Size"
                    open={openSections.size}
                    onToggle={() => toggleSection('size')}
                >
                    <CheckboxFilterList
                        values={sizeOptions}
                        checkedValues={selectedSizes}
                        onToggle={onToggleSize}
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
                            onToggle={onToggleCategory}
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
