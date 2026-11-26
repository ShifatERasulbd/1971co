// "Out of stock" switches for product variants (one colour + one size each).
// The flag is saved on each variant row as `out_of_stock`; the shop then shows that colour/size as sold out.

export const isVariantOutOfStock = (row) => {
    const value = row?.out_of_stock;
    return value === true || value === 1 || value === '1' || value === 'true';
};

// True when a row is what a switch points at: one variant { key }, or a whole { color } or { size }
export const matchesVariantTarget = (row, target = {}) =>
    (target.key !== undefined && row?.key === target.key)
    || (target.color !== undefined && String(row?.color ?? '').trim() === String(target.color).trim())
    || (target.size !== undefined && String(row?.size ?? '').trim() === String(target.size).trim());

// Rows grouped by colour or size, in table order, with how many of them are out of stock
function groupRows(variantRows, field) {
    const groups = new Map();

    variantRows.forEach((row) => {
        const value = String(row?.[field] ?? '').trim();
        if (!value) {
            return;
        }

        const group = groups.get(value) || { value, total: 0, out: 0 };
        group.total += 1;
        if (isVariantOutOfStock(row)) {
            group.out += 1;
        }
        groups.set(value, group);
    });

    return [...groups.values()];
}

function GroupButton({ group, label, field, onChange, disabled }) {
    const allOut = group.out === group.total;
    const someOut = group.out > 0 && !allOut;

    return (
        <button
            type="button"
            disabled={disabled}
            aria-pressed={allOut}
            title={allOut ? `Put every ${label} variant back in stock` : `Mark every ${label} variant out of stock`}
            onClick={() => onChange?.({ [field]: group.value }, !allOut)}
            className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                allOut
                    ? 'border-destructive bg-destructive/10 text-destructive'
                    : someOut
                      ? 'border-amber-500 bg-amber-50 text-amber-800 hover:bg-amber-100'
                      : 'bg-background hover:bg-muted'
            }`}
        >
            <span className={allOut ? 'font-medium line-through' : 'font-medium'}>{label}</span>
            <span className="text-[10px] uppercase tracking-wide opacity-80">
                {allOut ? 'Out of stock' : someOut ? `${group.out}/${group.total} out` : 'In stock'}
            </span>
        </button>
    );
}

// Whole colour / whole size at once. Clicking marks all of its variants out of stock; clicking again
// puts them all back in stock. Single colour + size combinations use VariantStockToggle in the table.
export function VariantStockBulkControls({ variantRows = [], getColorLabel, getSizeLabel, onChange, disabled = false }) {
    const colors = groupRows(variantRows, 'color');
    const sizes = groupRows(variantRows, 'size');
    const outCount = variantRows.filter(isVariantOutOfStock).length;

    return (
        <div className="space-y-2 rounded-md border bg-background p-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-medium">Out of stock</p>
                <p className={`text-xs ${outCount > 0 ? 'font-medium text-destructive' : 'text-muted-foreground'}`}>
                    {outCount === 0
                        ? 'Every variant is in stock'
                        : `${outCount} of ${variantRows.length} variant${variantRows.length === 1 ? '' : 's'} out of stock`}
                </p>
            </div>
            <p className="text-xs text-muted-foreground">
                Click a colour or a size to mark all of its variants out of stock, and click again to bring them back.
                For one colour in one size, use the Availability column in the table. Remember to save the product.
            </p>

            {[
                { field: 'color', title: 'Colors', groups: colors, labelOf: getColorLabel },
                { field: 'size', title: 'Sizes', groups: sizes, labelOf: getSizeLabel },
            ].map(({ field, title, groups, labelOf }) =>
                groups.length > 0 ? (
                    <div key={field} className="flex flex-wrap items-center gap-2">
                        <span className="w-12 shrink-0 text-xs text-muted-foreground">{title}</span>
                        {groups.map((group) => (
                            <GroupButton
                                key={group.value}
                                group={group}
                                field={field}
                                label={labelOf ? labelOf(group.value) : group.value}
                                onChange={onChange}
                                disabled={disabled}
                            />
                        ))}
                    </div>
                ) : null,
            )}
        </div>
    );
}

// One colour + size combination (a table row)
export function VariantStockToggle({ row, onChange, disabled = false }) {
    const out = isVariantOutOfStock(row);
    const id = `variant-out-of-stock-${row.key}`;

    return (
        <div className="flex items-center gap-2 rounded-md border bg-background px-2 py-1">
            <input
                id={id}
                type="checkbox"
                checked={out}
                onChange={(event) => onChange?.({ key: row.key }, event.target.checked)}
                disabled={disabled}
                className="h-4 w-4 cursor-pointer accent-red-600 disabled:cursor-not-allowed"
            />
            <label htmlFor={id} className={`cursor-pointer whitespace-nowrap text-xs ${out ? 'font-medium text-destructive' : 'text-muted-foreground'}`}>
                {out ? 'Out of stock' : 'In stock'}
            </label>
        </div>
    );
}
