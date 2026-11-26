<?php

namespace App\Services;

use App\Models\Color;
use App\Models\Product;
use App\Models\Size;

/**
 * Product variants (one colour + one size) that are marked out of stock in the admin panel.
 * The flag is stored on each row of products.variant_rows as "out_of_stock".
 */
class VariantAvailability
{
    public static function isOutOfStock(mixed $row): bool
    {
        return is_array($row)
            && filter_var($row['out_of_stock'] ?? false, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) === true;
    }

    /**
     * The cart lines whose colour/size is marked out of stock.
     * A line whose variant can't be found is left alone, so a sale is never blocked by mistake.
     *
     * @param  array<int, array<string, mixed>>  $items  cart lines: lineId, productId, name, sku, selectedColor, selectedSize
     * @return array<int, array{lineId: ?string, name: string, selectedColor: string, selectedSize: string}>
     */
    public function unavailableItems(array $items): array
    {
        $products = Product::query()->get();
        $colorNames = Color::query()->pluck('name', 'id')->all();
        $sizeNames = Size::query()->pluck('size', 'id')->all();

        $productsByKey = [];
        $rowsBySku = [];
        foreach ($products as $product) {
            foreach ([$product->id, $product->slug ?? null, $product->name] as $key) {
                $key = self::token($key);
                if ($key !== '') {
                    $productsByKey[$key] ??= $product;
                }
            }

            foreach (self::rows($product) as $row) {
                $sku = self::token($row['sku'] ?? '');
                if ($sku !== '') {
                    $rowsBySku[$sku] ??= $row;
                }
            }
        }

        $unavailable = [];
        foreach ($items as $item) {
            if (! is_array($item)) {
                continue;
            }

            $product = $productsByKey[self::token($item['productId'] ?? '')] ?? null;

            // The colour and size the shopper picked come first; the SKU covers lines whose
            // variant lives on a sibling product (the shop merges products that share a name).
            $row = ($product ? $this->findByColorAndSize($product, $item, $colorNames, $sizeNames) : null)
                ?? $rowsBySku[self::token($item['sku'] ?? '')] ?? null;

            if (self::isOutOfStock($row)) {
                $unavailable[] = [
                    'lineId' => isset($item['lineId']) ? (string) $item['lineId'] : null,
                    'name' => (string) ($item['name'] ?? $product?->name ?? 'Item'),
                    'selectedColor' => (string) ($item['selectedColor'] ?? ''),
                    'selectedSize' => (string) ($item['selectedSize'] ?? ''),
                ];
            }
        }

        return $unavailable;
    }

    /**
     * Variant row of $product for the line's colour and size. They can be ids or names
     * (the product page sends names, the shop's quick-add window sends ids).
     */
    private function findByColorAndSize(Product $product, array $item, array $colorNames, array $sizeNames): ?array
    {
        $color = self::token($item['selectedColor'] ?? '');
        $size = self::token($item['selectedSize'] ?? '');
        if ($color === '' || $size === '') {
            return null;
        }

        foreach (self::rows($product) as $row) {
            if (self::matches($row['color'] ?? '', $color, $colorNames)
                && self::matches($row['size'] ?? '', $size, $sizeNames)) {
                return $row;
            }
        }

        return null;
    }

    /** True when one of the row's ids (or its name) equals the picked value. */
    private static function matches(mixed $rowValue, string $picked, array $namesById): bool
    {
        foreach (explode(',', (string) $rowValue) as $id) {
            $id = trim($id);
            if ($id !== '' && (self::token($id) === $picked || self::token($namesById[$id] ?? '') === $picked)) {
                return true;
            }
        }

        return false;
    }

    /** @return array<int, array<string, mixed>> */
    private static function rows(Product $product): array
    {
        $rows = $product->variant_rows;
        if (is_string($rows)) {
            $rows = json_decode($rows, true);
        }

        return is_array($rows) ? array_values(array_filter($rows, 'is_array')) : [];
    }

    private static function token(mixed $value): string
    {
        return is_scalar($value) ? mb_strtolower(trim((string) $value)) : '';
    }
}
