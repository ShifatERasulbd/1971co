<?php

namespace App\Console\Commands;

use App\Services\CatalogImageCache;
use Illuminate\Console\Command;

class CacheCatalogImages extends Command
{
    protected $signature = 'catalog:cache-images {--fresh : Remake every copy, including ones that are up to date}';

    protected $description = 'Make the small WebP copies of the digital catalogue photos ahead of time';

    public function handle(): int
    {
        $made = 0;
        $upToDate = 0;
        $failed = [];

        foreach (CatalogImageCache::catalogImages() as $original) {
            if (! $this->option('fresh') && CatalogImageCache::isFresh($original)) {
                $upToDate++;
                continue;
            }

            if (CatalogImageCache::build($original)) {
                $made++;
            } else {
                $failed[] = $original;
            }
        }

        $this->info("Catalogue images: {$made} made, {$upToDate} already up to date"
            . ($failed ? ', ' . count($failed) . ' could not be converted' : '') . '.');

        foreach ($failed as $original) {
            $this->warn('  ' . $original);
        }

        return $failed ? self::FAILURE : self::SUCCESS;
    }
}
