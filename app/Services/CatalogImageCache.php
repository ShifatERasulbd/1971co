<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;

/**
 * Small WebP copies of the digital catalogue's photos, kept as plain files in
 * public/uploads/cache/catalog-1400/<path inside uploads>.webp so the web server sends them straight
 * from disk without starting Laravel.
 *
 * Copies are made ahead of time by `php artisan catalog:cache-images` (the scheduler runs it every
 * ten minutes). A copy that is still missing is made on its first request (route in routes/web.php).
 *
 * Keep DIRECTORY in sync with CATALOG_CACHE_DIR in resources/js/frontend/pages/Catelog.jsx.
 */
class CatalogImageCache
{
    public const DIRECTORY = 'uploads/cache/catalog-1400';

    private const WIDTH = 1400;
    private const QUALITY = 80;

    private const IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

    // Shown on every visit, whatever the products are (paths inside public/uploads)
    private const FIXED_IMAGES = ['catelog/coverPhoto.jpeg', 'catelog/home_image.png'];

    /**
     * Absolute path of an uploaded photo, from its path inside public/uploads ("products/gallery/a.jpg").
     * Null when it is not an image file inside public/uploads, or is itself a cached copy.
     */
    public static function original(string $path): ?string
    {
        $uploads = self::uploadsRoot();
        $file = realpath(public_path('uploads/' . ltrim(str_replace('\\', '/', $path), '/')));

        if (! $uploads || ! $file || ! is_file($file) || ! str_starts_with($file, $uploads . DIRECTORY_SEPARATOR)) {
            return null;
        }

        if (str_starts_with(self::insideUploads($file), 'cache/')) {
            return null;
        }

        return in_array(strtolower((string) File::mimeType($file)), self::IMAGE_TYPES, true) ? $file : null;
    }

    /** Where the copy of an original lives (the file may not exist yet). */
    public static function copyPath(string $original): string
    {
        return public_path(self::DIRECTORY . '/' . self::insideUploads($original) . '.webp');
    }

    /** True when the copy exists and is not older than the original. */
    public static function isFresh(string $original): bool
    {
        $copy = self::copyPath($original);

        return File::exists($copy) && File::lastModified($copy) >= File::lastModified($original);
    }

    public static function build(string $original): bool
    {
        return WebpImageWriter::write($original, self::copyPath($original), self::WIDTH, null, self::QUALITY);
    }

    /**
     * Every photo the catalogue can show, as absolute paths of the originals.
     * Follows the picks in Catelog.jsx, plus a few spare colour photos so a change of pick is covered too.
     *
     * @return string[]
     */
    public static function catalogImages(): array
    {
        $paths = self::FIXED_IMAGES;
        $add = function ($value) use (&$paths) {
            if (! is_string($value) || trim($value) === '') {
                return;
            }

            $path = ltrim((string) parse_url(trim($value), PHP_URL_PATH), '/');
            if (str_starts_with($path, 'uploads/')) {
                $paths[] = substr($path, strlen('uploads/'));
            }
        };

        $columns = array_values(array_filter(
            ['cover_image', 'color_variant_images', 'catalog_thumb_image', 'catalog_feature_images', 'catalog_swatch_image', 'catalog_color_images'],
            fn (string $column) => Schema::hasColumn('products', $column),
        ));

        Product::query()
            ->select(['id', ...$columns])
            ->when(Schema::hasColumn('products', 'is_active'), fn ($query) => $query->where('is_active', true))
            ->get()
            ->each(function (Product $product) use ($add) {
                $add($product->catalog_thumb_image ?? null);
                $add($product->cover_image ?? null);
                $add($product->catalog_swatch_image ?? null);

                foreach (array_slice(self::toList($product->catalog_feature_images ?? null), 0, 6) as $image) {
                    $add($image);
                }

                foreach (self::toList($product->catalog_color_images ?? null) as $image) {
                    $add($image);
                }

                foreach (self::toList($product->color_variant_images ?? null) as $images) {
                    foreach (array_slice(self::toList($images), 0, 3) as $image) {
                        $add($image);
                    }
                }
            });

        return array_values(array_unique(array_filter(array_map([self::class, 'original'], $paths))));
    }

    private static function toList($value): array
    {
        if (is_string($value)) {
            $value = json_decode($value, true);
        }

        return is_array($value) ? array_values($value) : [];
    }

    private static function uploadsRoot(): ?string
    {
        static $root = null;

        return $root ??= (realpath(public_path('uploads')) ?: null);
    }

    private static function insideUploads(string $file): string
    {
        return str_replace('\\', '/', substr($file, strlen((string) self::uploadsRoot()) + 1));
    }
}
