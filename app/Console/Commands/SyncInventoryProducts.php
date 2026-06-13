<?php

namespace App\Console\Commands;

use App\Models\Product;
use Illuminate\Console\Command;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class SyncInventoryProducts extends Command
{
    protected $signature = 'products:sync-inventory';

    protected $description = 'Sync products from Inventory API into local database';

    public function handle(): int
    {
        $baseUrl = rtrim((string) config('services.inventory.base_url'), '/');
        $apiKey = (string) config('services.inventory.canada_api_key');
        $warehouseId = (int) config('services.inventory.canada_warehouse_id');
        $verifySsl = filter_var(config('services.inventory.verify_ssl', true), FILTER_VALIDATE_BOOL);
        $caBundlePath = trim((string) config('services.inventory.ca_bundle_path', ''));

        if ($baseUrl === '' || $apiKey === '') {
            $this->error('Inventory API configuration is missing.');
            return self::FAILURE;
        }

        $httpOptions = [
            'verify' => $caBundlePath !== '' ? $caBundlePath : $verifySsl,
        ];

        try {
            $response = Http::timeout(20)
                ->withOptions($httpOptions)
                ->acceptJson()
                ->withHeaders(['X-API-Key' => $apiKey])
                ->get($baseUrl . '/api/public/stocks', array_filter(['warehouse_id' => $warehouseId ?: null]));
        } catch (ConnectionException $exception) {
            $this->error(
                str_contains($exception->getMessage(), 'cURL error 60')
                    ? 'SSL certificate error. Set INVENTORY_API_VERIFY_SSL=false or configure CA bundle.'
                    : 'Failed to connect to Inventory API.'
            );

            return self::FAILURE;
        }

        if (! $response->successful()) {
            $upstream = $response->json();
            $this->error(
                is_array($upstream)
                    ? ($upstream['message'] ?? 'Inventory API returned an error.')
                    : 'Inventory API returned an error.'
            );

            return self::FAILURE;
        }

        $payload = $response->json();
        $stocks = is_array($payload['data'] ?? null) ? $payload['data'] : (is_array($payload) ? $payload : []);

        if (empty($stocks)) {
            $this->warn('No products returned from Inventory API.');
            return self::SUCCESS;
        }

        $rowsToSync = [];
        foreach ($stocks as $row) {
            if (! is_array($row)) {
                continue;
            }

            $rawBarcode = $row['barcode'] ?? null;
            if (is_array($rawBarcode)) {
                $barcodeArray = $rawBarcode;
                $rawBarcode = null;
                foreach ($barcodeArray as $bc) {
                    if (is_scalar($bc) && $bc !== "" && $bc !== null) {
                        $rawBarcode = (string) $bc;
                        break;
                    }
                }
            }
            $barcode = is_string($rawBarcode) && trim($rawBarcode) !== "" ? trim($rawBarcode) : null;
            $sku = $barcode;

            if (! $sku) {
                $rawProductId = $row['product_id'] ?? null;
                if (is_array($rawProductId)) {
                    $rawProductId = current(array_filter($rawProductId, 'is_scalar'));
                }
                $sku = 'INV-' . ($rawProductId ?: uniqid());
            }
            
            if (strlen($sku) > 191) {
                $sku = substr($sku, 0, 191);
            }

            $stock = (int) ($row['stocks'] ?? $row['available_stock'] ?? 0);
            $price = $this->extractSellingPrice($row);

            $name = $row['product_name'] ?? $row['product']['name'] ?? $sku;
            $name = trim((string) $name);
            if ($name === '') {
                continue;
            }

            $size = $this->normalizeVariantValue($row['size_variant']['size'] ?? ($row['size'] ?? ($row['product']['size'] ?? null)));
            $color = $this->normalizeVariantValue($row['color_variant']['name'] ?? ($row['color'] ?? ($row['product']['color'] ?? null)));
            $groupKey = mb_strtolower($name . '|' . ($color ?? 'uncategorized') . '|' . ($size ?? 'no-size'));
            $groupSku = $this->buildProductSku($row['product_id'] ?? null, $name, $color);

            $coverImage = $row['cover_image_url'] ?? null;
            if ($coverImage && ! str_starts_with($coverImage, 'http')) {
                $coverImage = $baseUrl . '/' . ltrim($coverImage, '/');
            }

            if (! isset($rowsToSync[$groupKey])) {
                $rowsToSync[$groupKey] = [
                    'sku' => $groupSku,
                    'name' => $name,
                    'price' => $price ?? 0.0,
                    'stock' => 0,
                    'image' => $coverImage,
                    'colors' => [],
                    'size' => $size,
                    'barcodes' => [],
                    'product_ids' => [],
                    'variants' => [],
                ];
            }

            $rowsToSync[$groupKey]['stock'] += max(0, $stock);

            if ($price !== null) {
                $rowsToSync[$groupKey]['price'] = $price;
            }

            if (! $rowsToSync[$groupKey]['image'] && $coverImage) {
                $rowsToSync[$groupKey]['image'] = $coverImage;
            }

            if ($barcode !== null) {
                $rowsToSync[$groupKey]['barcodes'][] = $barcode;
            }

            if (! empty($row['product_id'])) {
                $rowsToSync[$groupKey]['product_ids'][] = $row['product_id'];
            }

            if ($color !== null) {
                $rowsToSync[$groupKey]['colors'][] = $color;
            }

            if ($size !== null && ($rowsToSync[$groupKey]['size'] === null || $rowsToSync[$groupKey]['size'] === '')) {
                $rowsToSync[$groupKey]['size'] = $size;
            }

            $rowsToSync[$groupKey]['variants'][] = [
                'color' => $color,
                'size' => $size,
                'price' => $price ?? 0.0,
                'stock' => $stock,
                'barcode' => $barcode,
                'product_id' => $row['product_id'] ?? null,
            ];
        }

        $productColumns = array_flip(Schema::getColumnListing('products'));
        $hasSkuColumn = isset($productColumns['sku']);
        $hasNameColumn = isset($productColumns['name']);

        if (! $hasSkuColumn && ! $hasNameColumn) {
            $this->error('Products table must include at least sku or name column for sync.');
            return self::FAILURE;
        }

        foreach ($rowsToSync as $item) {
            $colors = array_values(array_unique(array_filter($item['colors'])));
            $size = $item['size'];
            $barcodes = array_values(array_unique(array_filter($item['barcodes'])));
            $productIds = array_values(array_unique(array_filter($item['product_ids'])));

            $lookup = $hasSkuColumn
                ? ['sku' => $item['sku']]
                : ['name' => $item['name']];

            $updateData = [
                'name' => $item['name'],
                'price' => $item['price'],
                'stock' => $item['stock'],
                'cover_image' => $item['image'],
                'color' => json_encode($colors, JSON_UNESCAPED_SLASHES),
                'size' => $size,
                'barcode' => $barcodes[0] ?? null,
                'available_products' => [
                    'product_name' => $item['name'],
                    'product_ids' => $productIds,
                    'barcodes' => $barcodes,
                    'colors' => $colors,
                    'sizes' => $size !== null ? [$size] : [],
                    'size_variants' => $size !== null ? [$size] : [],
                    'size' => $size,
                    'variants' => $item['variants'],
                    'warehouse_name' => config('services.inventory.canada_warehouse_name', 'Canada Warehouse'),
                    'variant_count' => max(count($colors), $size !== null ? 1 : 0, count($barcodes), 1),
                ],
            ];

            $updateData = array_filter(
                $updateData,
                fn (mixed $value, string $key): bool => isset($productColumns[$key]),
                ARRAY_FILTER_USE_BOTH,
            );

            Product::updateOrCreate(
                $lookup,
                $updateData,
            );
        }

        // Remove products that are no longer in the sync set (stale rows from old syncs)
        $syncedSkus = array_values(array_map(fn (array $item): string => $item['sku'], $rowsToSync));
        if (! empty($syncedSkus)) {
            $pruned = Product::whereNotIn('sku', $syncedSkus)->delete();
            if ($pruned > 0) {
                $this->info("Pruned {$pruned} stale product(s) from local database.");
            }
        }

        $this->info('Successfully synced ' . count($rowsToSync) . ' products from Inventory API.');

        return self::SUCCESS;
    }

    private function buildProductSku(mixed $productId, string $name, ?string $color = null): string
    {
        $baseLabel = trim($name . ' ' . ($color ?? ''));
        $baseSku = $productId ? 'INV-' . $productId . ($color ? '-' . Str::slug($color) : '') : Str::slug($baseLabel);

        return substr($baseSku !== '' ? $baseSku : uniqid('inv-', true), 0, 191);
    }

    private function normalizeVariantValue(mixed $value): ?string
    {
        if (! is_scalar($value)) {
            return null;
        }

        $value = trim((string) $value);

        return $value === '' ? null : $value;
    }

    private function extractSellingPrice(array $row): ?float
    {
        $candidates = [
            $row['effective_selling_price'] ?? null,
            $row['selling_price'] ?? null,
            $row['stock_selling_price'] ?? null,
            $row['sellingPrice'] ?? null,
            $row['price'] ?? null,
            $row['product']['selling_price'] ?? null,
            $row['stock']['selling_price'] ?? null,
            $row['size_variant']['selling_price'] ?? null,
        ];

        foreach ($candidates as $candidate) {
            $price = $this->normalizeMoneyValue($candidate);
            if ($price !== null) {
                return $price;
            }
        }

        return null;
    }

    private function normalizeMoneyValue(mixed $value): ?float
    {
        if ($value === null || $value === '') {
            return null;
        }

        if (is_int($value) || is_float($value)) {
            return round((float) $value, 2);
        }

        if (! is_string($value)) {
            return null;
        }

        $normalized = trim($value);
        if ($normalized === '') {
            return null;
        }

        $normalized = str_replace(',', '', $normalized);
        $normalized = preg_replace('/[^0-9.\-]/', '', $normalized) ?? '';

        if ($normalized === '' || ! is_numeric($normalized)) {
            return null;
        }

        return round((float) $normalized, 2);
    }

    private function resolveColorCode(?string $color): ?string
    {
        if ($color === null) {
            return null;
        }

        $map = [
            'black' => '#111827',
            'blue' => '#2563eb',
            'brown' => '#92400e',
            'gray' => '#6b7280',
            'green' => '#16a34a',
            'navy' => '#1d4ed8',
            'orange' => '#ea580c',
            'pink' => '#ec4899',
            'purple' => '#7c3aed',
            'red' => '#dc2626',
            'white' => '#f9fafb',
            'yellow' => '#eab308',
        ];

        return $map[strtolower($color)] ?? null;
    }
}
