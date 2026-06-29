<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Http\Client\ConnectionException;
use App\Services\InventoryProductStockSyncService;
use RuntimeException;

class SyncInventoryProducts extends Command
{
    protected $signature = 'products:sync-inventory';

    protected $description = 'Sync variant stock from Inventory API into the local database';

    public function __construct(private readonly InventoryProductStockSyncService $inventoryProductStockSyncService)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        try {
            $result = $this->inventoryProductStockSyncService->sync();
        } catch (ConnectionException|RuntimeException $exception) {
            $this->error($exception->getMessage());

            return self::FAILURE;
        }

        if ($result['rows'] === 0) {
            $this->warn('No products returned from Inventory API.');

            return self::SUCCESS;
        }

        $this->info('Successfully refreshed stock for ' . $result['updated'] . ' product variant(s).');

        return self::SUCCESS;
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
