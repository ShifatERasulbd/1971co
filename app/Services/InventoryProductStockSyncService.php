<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class InventoryProductStockSyncService
{
    public function sync(): array
    {
        $rows = $this->fetchInventoryStockRows();
        $products = Product::query()->get();
        $index = $this->buildProductIndex($products);

        $matched = 0;
        $updated = 0;
        $skipped = 0;

        foreach ($rows as $row) {
            if (! is_array($row)) {
                $skipped++;
                continue;
            }

            $product = $this->findMatchingProduct($row, $index);

            if ($product === null) {
                $skipped++;
                continue;
            }

            $matched++;
            $stock = $this->extractStockValue($row);

            if ((int) $product->stock !== $stock) {
                $product->forceFill(['stock' => $stock])->save();
                $updated++;
            }
        }

        return [
            'rows' => count($rows),
            'matched' => $matched,
            'updated' => $updated,
            'skipped' => $skipped,
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function fetchInventoryStockRows(): array
    {
        $baseUrl = rtrim((string) config('services.inventory.base_url'), '/');
        $apiKey = (string) config('services.inventory.canada_api_key');
        $warehouseId = (int) config('services.inventory.canada_warehouse_id');
        $verifySsl = filter_var(config('services.inventory.verify_ssl', true), FILTER_VALIDATE_BOOL);
        $caBundlePath = trim((string) config('services.inventory.ca_bundle_path', ''));

        if ($baseUrl === '' || $apiKey === '') {
            throw new RuntimeException('Inventory API configuration is missing.');
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
            throw new ConnectionException(
                str_contains($exception->getMessage(), 'cURL error 60')
                    ? 'SSL certificate error. Set INVENTORY_API_VERIFY_SSL=false or configure CA bundle.'
                    : 'Failed to connect to Inventory API.',
                0,
                $exception
            );
        }

        if (! $response->successful()) {
            $upstream = $response->json();

            throw new RuntimeException(
                is_array($upstream)
                    ? ($upstream['message'] ?? 'Inventory API returned an error.')
                    : 'Inventory API returned an error.'
            );
        }

        $payload = $response->json();

        return is_array($payload['data'] ?? null)
            ? $payload['data']
            : (is_array($payload) ? $payload : []);
    }

    /**
     * @param iterable<int, Product> $products
     * @return array<string, array<string, Product>>
     */
    private function buildProductIndex(iterable $products): array
    {
        $index = [
            'product_id' => [],
            'barcode' => [],
            'sku' => [],
            'name' => [],
            'variant' => [],
        ];

        foreach ($products as $product) {
            if (! $product instanceof Product) {
                continue;
            }

            foreach ($this->normalizeTokens($product->barcode) as $token) {
                $index['barcode'][$token] = $product;
            }

            foreach ($this->normalizeTokens($product->sku) as $token) {
                $index['sku'][$token] = $product;
            }

            foreach ($this->normalizeTokens($product->name) as $token) {
                $index['name'][$token] = $product;
            }

            foreach ($this->extractInventoryProductIds($product->available_products) as $token) {
                $index['product_id'][$token] = $product;
            }

            foreach ($this->buildVariantKeys($product) as $token) {
                $index['variant'][$token] = $product;
            }
        }

        return $index;
    }

    /**
     * @param array<string, array<string, Product>> $index
     */
    private function findMatchingProduct(array $row, array $index): ?Product
    {
        $productId = $this->normalizeKey($row['product_id'] ?? null);
        if ($productId !== null && isset($index['product_id'][$productId])) {
            return $index['product_id'][$productId];
        }

        $barcode = $this->normalizeKey($this->extractBarcodeValue($row));
        if ($barcode !== null && isset($index['barcode'][$barcode])) {
            return $index['barcode'][$barcode];
        }

        $sku = $this->normalizeKey($this->extractSkuValue($row));
        if ($sku !== null && isset($index['sku'][$sku])) {
            return $index['sku'][$sku];
        }

        $name = $this->normalizeKey($this->extractNameValue($row));
        $color = $this->normalizeKey($this->extractColorValue($row));
        $size = $this->normalizeKey($this->extractSizeValue($row));

        foreach ($this->buildCandidateVariantKeys($name, $color, $size) as $variantKey) {
            if (isset($index['variant'][$variantKey])) {
                return $index['variant'][$variantKey];
            }
        }

        if ($name !== null && isset($index['name'][$name])) {
            return $index['name'][$name];
        }

        return null;
    }

    private function extractStockValue(array $row): int
    {
        return max(0, (int) ($row['stocks'] ?? $row['available_stock'] ?? 0));
    }

    private function extractBarcodeValue(array $row): mixed
    {
        $rawBarcode = $row['barcode'] ?? null;

        if (is_array($rawBarcode)) {
            $rawBarcode = implode('-', array_filter($rawBarcode, 'is_scalar')) ?: null;
        }

        return is_string($rawBarcode) && trim($rawBarcode) !== '' ? trim($rawBarcode) : null;
    }

    private function extractSkuValue(array $row): mixed
    {
        $sku = $row['sku'] ?? null;

        return is_string($sku) && trim($sku) !== '' ? trim($sku) : null;
    }

    private function extractNameValue(array $row): string
    {
        return trim((string) ($row['product_name'] ?? $row['product']['name'] ?? ''));
    }

    private function extractColorValue(array $row): ?string
    {
        return $this->normalizeVariantValue($row['color_variant']['name'] ?? ($row['color'] ?? ($row['product']['color'] ?? null)));
    }

    private function extractSizeValue(array $row): ?string
    {
        return $this->normalizeVariantValue($row['size_variant']['size'] ?? ($row['size'] ?? ($row['product']['size'] ?? null)));
    }

    private function extractInventoryProductIds(mixed $availableProducts): array
    {
        if (! is_array($availableProducts)) {
            return [];
        }

        $values = [];

        foreach ([$availableProducts['product_ids'] ?? [], $availableProducts['variants'] ?? []] as $entry) {
            if (! is_array($entry)) {
                continue;
            }

            foreach ($entry as $item) {
                $candidate = is_array($item) ? ($item['product_id'] ?? null) : $item;
                $candidate = $this->normalizeKey($candidate);

                if ($candidate !== null) {
                    $values[] = $candidate;
                }
            }
        }

        return array_values(array_unique($values));
    }

    private function buildVariantKeys(Product $product): array
    {
        $name = $this->normalizeKey($product->name);

        if ($name === null) {
            return [];
        }

        $colors = $this->normalizeTokens($product->color);
        $sizes = $this->normalizeTokens($product->size);

        if ($colors === []) {
            $colors = [null];
        }

        if ($sizes === []) {
            $sizes = [null];
        }

        $keys = [];
        foreach ($colors as $color) {
            foreach ($sizes as $size) {
                $keys[] = $this->composeVariantKey($name, $color, $size);
            }
        }

        return array_values(array_unique(array_filter($keys, static fn (string $value): bool => $value !== '')));
    }

    /**
     * @return array<int, string>
     */
    private function buildCandidateVariantKeys(?string $name, ?string $color, ?string $size): array
    {
        if ($name === null) {
            return [];
        }

        return array_values(array_unique(array_filter([
            $this->composeVariantKey($name, $color, $size),
            $this->composeVariantKey($name, $color, null),
            $this->composeVariantKey($name, null, $size),
        ], static fn (string $value): bool => $value !== '')));
    }

    private function composeVariantKey(string $name, ?string $color, ?string $size): string
    {
        return mb_strtolower(trim($name) . '|' . ($color ?? 'uncategorized') . '|' . ($size ?? 'no-size'));
    }

    /**
     * @return array<int, string>
     */
    private function normalizeTokens(mixed $value): array
    {
        if (is_array($value)) {
            $tokens = [];

            foreach ($value as $item) {
                $normalized = $this->normalizeKey($item);

                if ($normalized !== null) {
                    $tokens[] = $normalized;
                }
            }

            return array_values(array_unique($tokens));
        }

        if (! is_string($value)) {
            $normalized = $this->normalizeKey($value);
            return $normalized !== null ? [$normalized] : [];
        }

        $trimmed = trim($value);

        if ($trimmed === '') {
            return [];
        }

        $decoded = json_decode($trimmed, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            return $this->normalizeTokens($decoded);
        }

        $parts = preg_split('/\s*,\s*/', $trimmed) ?: [$trimmed];
        $tokens = [];

        foreach ($parts as $part) {
            $normalized = $this->normalizeKey($part);

            if ($normalized !== null) {
                $tokens[] = $normalized;
            }
        }

        return array_values(array_unique($tokens));
    }

    private function normalizeVariantValue(mixed $value): ?string
    {
        if (! is_scalar($value)) {
            return null;
        }

        $value = trim((string) $value);

        return $value === '' ? null : $value;
    }

    private function normalizeKey(mixed $value): ?string
    {
        if (! is_scalar($value)) {
            return null;
        }

        $value = preg_replace('/\s+/', ' ', trim((string) $value)) ?? '';

        return $value === '' ? null : mb_strtolower($value);
    }
}