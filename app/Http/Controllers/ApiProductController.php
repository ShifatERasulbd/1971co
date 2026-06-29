<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Services\InventoryProductStockSyncService;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\JsonResponse;
use RuntimeException;

class ApiProductController extends Controller
{
    public function __construct(private readonly InventoryProductStockSyncService $inventoryProductStockSyncService)
    {
    }

    public function index(): JsonResponse
    {
        $query = Product::query()
            ->orderBy('name');

        if (Schema::hasColumn('products', 'size')) {
            $query->orderBy('size');
        }

        if (Schema::hasColumn('products', 'color')) {
            $query->orderBy('color');
        }

        $products = $query
            ->orderBy('sku')
            ->get()
            ->map(fn (Product $product): array => $this->formatProduct($product));

        return response()->json($products);
    }

    public function sync(): JsonResponse
    {
        try {
            $result = $this->inventoryProductStockSyncService->sync();
        } catch (ConnectionException|RuntimeException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], str_contains($exception->getMessage(), 'SSL certificate error') ? 502 : 500);
        }

        return response()->json([
            'message' => 'Variant stock refreshed successfully.',
            'synced' => $result['matched'],
            'updated' => $result['updated'],
            'skipped' => $result['skipped'],
        ]);
    }

    private function formatProduct(Product $product): array
    {
        $color = $this->decodeJsonList($product->color);
        $size = $this->decodeJsonList($product->size);
        $warehouseName = config('services.inventory.canada_warehouse_name', 'Canada Warehouse');

        return [
            'id' => $product->id,
            'product_id' => $product->id,
            'name' => $product->name,
            'product_name' => $product->name,
            'sku' => $product->sku,
            'available_products' => $product->available_products,
            'barcode' => $product->barcode,
            'color' => $color,
            'color_variant' => $this->buildPrimaryColorVariant($color),
            'size' => $size,
            'size_variants' => is_array($product->available_products['size_variants'] ?? null)
                ? array_values(array_filter($product->available_products['size_variants']))
                : ($size !== null ? [$size] : []),
            'size_variant' => $this->buildPrimarySizeVariant($size),
            'description' => $product->description,
            'price' => $product->price,
            'selling_price' => $product->price,
            'cover_image' => $product->cover_image,
            'cover_image_url' => $product->cover_image,
            'stock' => $product->stock,
            'stocks' => $product->stock,
            'warehouse_name' => $warehouseName,
            'warehouse_id' => (int) config('services.inventory.canada_warehouse_id'),
            'created_at' => $product->created_at,
            'updated_at' => $product->updated_at,
        ];
    }

    private function decodeJsonList(mixed $value): array|string|null
    {
        if (is_array($value)) {
            return array_values(array_filter($value, fn ($item) => is_scalar($item) && trim((string) $item) !== ''));
        }

        if (! is_string($value)) {
            return null;
        }

        $trimmed = trim($value);
        if ($trimmed === '') {
            return null;
        }

        $decoded = json_decode($trimmed, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            return array_values(array_filter($decoded, fn ($item) => is_scalar($item) && trim((string) $item) !== ''));
        }

        return $trimmed;
    }

    private function buildPrimaryColorVariant(array|string|null $color): ?array
    {
        if (! is_array($color) || empty($color)) {
            return is_string($color) && $color !== '' ? [
                'name' => $color,
                'color_code' => $this->resolveColorCode($color),
            ] : null;
        }

        $first = $color[0] ?? null;
        if (! is_string($first) || $first === '') {
            return null;
        }

        return [
            'name' => $first,
            'color_code' => $this->resolveColorCode($first),
        ];
    }

    private function buildPrimarySizeVariant(array|string|null $size): ?array
    {
        if (! is_array($size) || empty($size)) {
            return is_string($size) && $size !== '' ? ['size' => $size] : null;
        }

        $first = $size[0] ?? null;
        if (! is_string($first) || $first === '') {
            return null;
        }

        return ['size' => $first];
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
