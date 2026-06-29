<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ApiProductStockSyncTest extends TestCase
{
    use RefreshDatabase;

    public function test_sync_updates_only_variant_stock_values(): void
    {
        config([
            'services.inventory.base_url' => 'https://inventory.test',
            'services.inventory.canada_api_key' => 'inventory-test-key',
            'services.inventory.canada_warehouse_id' => 12,
            'services.inventory.verify_ssl' => false,
            'services.inventory.ca_bundle_path' => '',
        ]);

        Http::fake([
            'https://inventory.test/api/public/stocks*' => Http::response([
                'data' => [
                    [
                        'product_id' => 101,
                        'product_name' => 'Canvas Shirt',
                        'barcode' => 'BC-001',
                        'color_variant' => ['name' => 'Black'],
                        'size_variant' => ['size' => 'M'],
                        'stocks' => 9,
                    ],
                    [
                        'product_id' => 102,
                        'product_name' => 'Canvas Shirt',
                        'barcode' => 'BC-002',
                        'color_variant' => ['name' => 'Black'],
                        'size_variant' => ['size' => 'L'],
                        'stocks' => 4,
                    ],
                ],
            ]),
        ]);

        $admin = User::factory()->create([
            'user_type' => 'admin',
        ]);

        $firstVariant = Product::create([
            'name' => 'Canvas Shirt',
            'slug' => 'canvas-shirt-m',
            'sku' => 'BC-001',
            'barcode' => 'BC-001',
            'color' => ['Black'],
            'size' => ['M'],
            'price' => 25.00,
            'stock' => 5,
            'available_products' => ['product_ids' => [101]],
        ]);

        $secondVariant = Product::create([
            'name' => 'Canvas Shirt',
            'slug' => 'canvas-shirt-l',
            'sku' => 'BC-002',
            'barcode' => 'BC-002',
            'color' => ['Black'],
            'size' => ['L'],
            'price' => 30.00,
            'stock' => 7,
            'available_products' => ['product_ids' => [102]],
        ]);

        $response = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/api-products/sync');

        $response->assertOk()
            ->assertJsonPath('synced', 2)
            ->assertJsonPath('updated', 2);

        $firstVariant->refresh();
        $secondVariant->refresh();

        $this->assertSame(9, $firstVariant->stock);
        $this->assertSame(4, $secondVariant->stock);
        $this->assertDatabaseCount('products', 2);
    }
}