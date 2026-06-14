<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function index(): JsonResponse
    {
        $products = Product::all();
       
        return response()->json($products);
    }

    public function publicIndex(): JsonResponse
    {
        $columns = [
            'id',
            'name',
            'price',
            'cover_image',
            'image_gallery',
            'color',
            'color_variant_images',
            'category_id',
            'subcategory_id',
            'show_on_best_sellers',
        ];

        if (Schema::hasColumn('products', 'slug')) {
            $columns[] = 'slug';
        }

        $products = Product::select($columns)
            ->where('show_on_best_sellers', true)
            ->orderBy('created_at', 'desc')
            ->limit(12)
            ->get();

        return response()->json($products);
    }

    public function show(Product $product): JsonResponse
    {
        return response()->json($product);
    }

    public function store(Request $request): JsonResponse
    {
        $this->normalizeBooleanFields($request, ['show_on_best_sellers']);
        $this->normalizeJsonFields($request, ['variant_rows', 'color_variant_images']);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'required|string|max:255',
            'color' => 'nullable|string|max:255',
            'size' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'long_description' => 'nullable|string',
            'additional_information' => 'nullable|string',
            'price' => 'required|numeric',
            'cover_image' => 'nullable|string',
            'thumbnail_image' => 'nullable|image|mimes:jpeg,jpg,png,webp|max:4096',
            'image_gallery' => 'nullable|array',
            'image_gallery.*' => 'image|mimes:jpeg,jpg,png,webp|max:4096',
            'category_id' => 'nullable|integer',
            'subcategory_id' => 'nullable|integer',
            'stock' => 'required|integer',
            'show_on_best_sellers' => 'nullable|boolean',
            'variant_rows' => 'nullable|array',
            'variant_rows.*.key' => 'nullable|string|max:255',
            'variant_rows.*.color' => 'nullable|string|max:255',
            'variant_rows.*.size' => 'nullable|string|max:255',
            'variant_rows.*.sku' => 'nullable|string|max:255',
            'variant_rows.*.stock' => 'nullable',
            'variant_rows.*.price' => 'nullable',
            'color_variant_images' => 'nullable|array',
            'color_variant_images.*' => 'nullable|array',
            'color_variant_images.*.*' => 'nullable|string|max:2048',
        ]);

        if ($request->hasFile('thumbnail_image')) {
            $validated['cover_image'] = $this->uploadThumbnailImage($request);
        }

        $uploadedGallery = [];
        $uploadedNameMap = [];

        if ($request->hasFile('image_gallery')) {
            $uploadedGalleryResult = $this->uploadImageGallery($request);
            $uploadedGallery = $uploadedGalleryResult['paths'];
            $uploadedNameMap = $uploadedGalleryResult['name_map'];
            $validated['image_gallery'] = $uploadedGallery;
        }

        $finalGallery = is_array($validated['image_gallery'] ?? null) ? $validated['image_gallery'] : [];
        $validated['variant_rows'] = $this->normalizeVariantRows($validated['variant_rows'] ?? []);
        $validated['show_on_best_sellers'] = $request->boolean('show_on_best_sellers');
        $validated['color_variant_images'] = $this->resolveColorVariantImages(
            $validated['color_variant_images'] ?? [],
            $finalGallery,
            $uploadedNameMap,
        );

        $product = Product::query()->updateOrCreate(
            ['name' => $validated['name']],
            $validated,
        );

        return response()->json([
            'message' => $product->wasRecentlyCreated
                ? 'Product created successfully'
                : 'Product updated successfully (matched by product name)',
            'product' => $product,
        ], $product->wasRecentlyCreated ? 201 : 200);
    }

    public function update(Request $request, Product $product): JsonResponse
    {
        $this->normalizeBooleanFields($request, ['show_on_best_sellers', 'clear_gallery']);
        $this->normalizeJsonFields($request, ['variant_rows', 'color_variant_images', 'image_gallery_existing']);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'required|string|max:255',
            'color' => 'nullable|string|max:255',
            'size' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'long_description' => 'nullable|string',
            'additional_information' => 'nullable|string',
            'price' => 'required|numeric',
            'cover_image' => 'nullable|string',
            'thumbnail_image' => 'nullable|image|mimes:jpeg,jpg,png,webp|max:4096',
            'image_gallery' => 'nullable|array',
            'image_gallery.*' => 'image|mimes:jpeg,jpg,png,webp|max:4096',
            'image_gallery_existing' => 'nullable|array',
            'image_gallery_existing.*' => 'nullable|string',
            'clear_gallery' => 'nullable|boolean',
            'category_id' => 'nullable|integer',
            'subcategory_id' => 'nullable|integer',
            'stock' => 'required|integer',
            'show_on_best_sellers' => 'nullable|boolean',
            'variant_rows' => 'nullable|array',
            'variant_rows.*.key' => 'nullable|string|max:255',
            'variant_rows.*.color' => 'nullable|string|max:255',
            'variant_rows.*.size' => 'nullable|string|max:255',
            'variant_rows.*.sku' => 'nullable|string|max:255',
            'variant_rows.*.stock' => 'nullable',
            'variant_rows.*.price' => 'nullable',
            'color_variant_images' => 'nullable|array',
            'color_variant_images.*' => 'nullable|array',
            'color_variant_images.*.*' => 'nullable|string|max:2048',
        ]);

        if ($request->hasFile('thumbnail_image')) {
            $validated['cover_image'] = $this->uploadThumbnailImage($request, $product->cover_image);
        }

        $existingGallery = $request->boolean('clear_gallery')
            ? []
            : (is_array($request->input('image_gallery_existing')) ? $request->input('image_gallery_existing') : ($product->image_gallery ?? []));

        $uploadedGallery = [];
        $uploadedNameMap = [];

        if ($request->hasFile('image_gallery')) {
            $uploadedGalleryResult = $this->uploadImageGallery($request);
            $uploadedGallery = $uploadedGalleryResult['paths'];
            $uploadedNameMap = $uploadedGalleryResult['name_map'];

            $validated['image_gallery'] = array_values(array_filter(array_merge(
                is_array($existingGallery) ? $existingGallery : [],
                $uploadedGallery,
            )));
        } elseif ($request->has('image_gallery_existing') || $request->has('clear_gallery')) {
            $validated['image_gallery'] = array_values(array_filter(is_array($existingGallery) ? $existingGallery : []));
        }

        $finalGallery = is_array($validated['image_gallery'] ?? null)
            ? $validated['image_gallery']
            : (is_array($product->image_gallery ?? null) ? $product->image_gallery : []);

        $validated['variant_rows'] = $this->normalizeVariantRows($validated['variant_rows'] ?? ($product->variant_rows ?? []));
        $validated['show_on_best_sellers'] = $request->boolean('show_on_best_sellers');
        $validated['color_variant_images'] = $this->resolveColorVariantImages(
            $validated['color_variant_images'] ?? ($product->color_variant_images ?? []),
            $finalGallery,
            $uploadedNameMap,
        );

        $product->update($validated);
        return response()->json(['message' => 'Product updated successfully', 'product' => $product]);
    }

    public function destroy(Product $product): JsonResponse
    {
        $deletedIds = [$product->id];
        $deletedCount = 0;

        request()->validate([
            'delete_scope' => 'nullable|in:single,group',
            'group_name' => 'nullable|string|max:255',
        ]);

        $requestedScope = request()->input('delete_scope', 'single');
        $groupName = trim((string) request()->input('group_name', $product->name));

        if ($requestedScope === 'group' && $groupName !== '') {
            $products = Product::query()
                ->whereRaw('LOWER(TRIM(name)) = ?', [mb_strtolower($groupName)])
                ->get(['id']);

            $deletedIds = $products->pluck('id')->all();
            if ($deletedIds !== []) {
                $deletedCount = Product::query()->whereIn('id', $deletedIds)->delete();
            }
        } else {
            $product->delete();
            $deletedCount = 1;
        }

        return response()->json([
            'message' => 'Product deleted successfully',
            'deleted_scope' => $requestedScope === 'group' ? 'group' : 'single',
            'deleted_count' => $deletedCount,
            'deleted_ids' => $deletedIds,
        ]);
    }

    private function uploadThumbnailImage(Request $request, ?string $existingPath = null): ?string
    {
        if (! $request->hasFile('thumbnail_image')) {
            return $existingPath;
        }

        $storedPath = $this->storeUploadedFileToPublic(
            $request->file('thumbnail_image'),
            'uploads/products/thumbnails',
        );

        $this->deleteUploadedFile($existingPath);

        return $storedPath;
    }

    private function uploadImageGallery(Request $request): array
    {
        if (! $request->hasFile('image_gallery')) {
            return ['paths' => [], 'name_map' => []];
        }

        $files = $request->file('image_gallery');
        $uploaded = [];
        $nameMap = [];

        foreach ($files as $file) {
            if (! $file) {
                continue;
            }
            $originalName = (string) $file->getClientOriginalName();
            $publicPath = $this->storeUploadedFileToPublic($file, 'uploads/products/gallery');
            $uploaded[] = $publicPath;

            if ($originalName !== '') {
                $nameMap[$originalName] = $publicPath;
            }
        }

        return [
            'paths' => $uploaded,
            'name_map' => $nameMap,
        ];
    }

    private function storeUploadedFileToPublic(UploadedFile $file, string $relativeDirectory): string
    {
        $directory = public_path(trim($relativeDirectory, '/'));

        if (! File::exists($directory)) {
            File::makeDirectory($directory, 0755, true);
        }

        $extension = strtolower((string) $file->getClientOriginalExtension());
        $filename = now()->format('YmdHis') . '-' . Str::random(10);
        if ($extension !== '') {
            $filename .= '.' . $extension;
        }

        $file->move($directory, $filename);

        return '/' . trim($relativeDirectory, '/') . '/' . $filename;
    }

    private function deleteUploadedFile(?string $path): void
    {
        if (! is_string($path) || trim($path) === '') {
            return;
        }

        if (str_starts_with($path, '/storage/')) {
            $oldStoragePath = ltrim(str_replace('/storage/', '', $path), '/');
            if ($oldStoragePath !== '') {
                Storage::disk('public')->delete($oldStoragePath);
            }
            return;
        }

        if (str_starts_with($path, '/uploads/')) {
            $absolutePath = public_path(ltrim($path, '/'));
            if (File::exists($absolutePath)) {
                File::delete($absolutePath);
            }
        }
    }

    private function normalizeJsonFields(Request $request, array $fields): void
    {
        foreach ($fields as $field) {
            $value = $request->input($field);

            if (! is_string($value)) {
                continue;
            }

            $decoded = json_decode($value, true);

            if (json_last_error() === JSON_ERROR_NONE) {
                $request->merge([$field => $decoded]);
            }
        }
    }

    private function normalizeBooleanFields(Request $request, array $fields): void
    {
        foreach ($fields as $field) {
            if (! $request->has($field)) {
                continue;
            }

            $value = $request->input($field);

            if (is_bool($value) || $value === null) {
                continue;
            }

            $request->merge([
                $field => filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE),
            ]);
        }
    }

    private function normalizeVariantRows($variantRows): array
    {
        if (! is_array($variantRows)) {
            return [];
        }

        return array_values(array_map(static function ($row): array {
            if (! is_array($row)) {
                return [];
            }

            return [
                'key' => (string) ($row['key'] ?? ''),
                'color' => (string) ($row['color'] ?? ''),
                'size' => (string) ($row['size'] ?? ''),
                'sku' => (string) ($row['sku'] ?? ''),
                'stock' => $row['stock'] ?? '',
                'price' => $row['price'] ?? '',
            ];
        }, $variantRows));
    }

    private function resolveColorVariantImages($mapping, array $finalGallery, array $uploadedNameMap = []): array
    {
        if (! is_array($mapping)) {
            return [];
        }

        $finalGallerySet = array_fill_keys($finalGallery, true);
        $resolved = [];

        foreach ($mapping as $color => $items) {
            if (! is_array($items) || trim((string) $color) === '') {
                continue;
            }

            $paths = [];

            foreach ($items as $item) {
                if (! is_string($item) || trim($item) === '') {
                    continue;
                }

                $raw = trim($item);

                if (isset($finalGallerySet[$raw])) {
                    $paths[] = $raw;
                    continue;
                }

                if (isset($uploadedNameMap[$raw])) {
                    $mappedPath = $uploadedNameMap[$raw];
                    if (isset($finalGallerySet[$mappedPath])) {
                        $paths[] = $mappedPath;
                    }
                }
            }

            $paths = array_values(array_unique($paths));
            if ($paths !== []) {
                $resolved[(string) $color] = $paths;
            }
        }

        return $resolved;
    }
}
