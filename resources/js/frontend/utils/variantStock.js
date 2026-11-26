// A variant (one colour + one size) marked out of stock in the admin panel: variant_rows[].out_of_stock
export function isVariantOutOfStock(row) {
    const value = row?.out_of_stock;
    return value === true || value === 1 || value === '1' || value === 'true';
}
