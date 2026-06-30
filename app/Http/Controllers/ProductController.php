<?php

namespace App\Http\Controllers;

use App\Models\Color;
use App\Models\Product;
use App\Models\Size;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    public function index(): JsonResponse
    {
        $products = Product::query()
            ->orderByRaw('position IS NULL')
            ->orderBy('position')
            ->orderByDesc('updated_at')
            ->get();
       
        return response()->json($products);
    }

    public function publicIndex(): JsonResponse
    {
        $columns = [
            'id',
            'name',
            'description',
            'fit',
            'fabric_and_care',
            'product_features',
            'product_composition',
            'long_description',
            'additional_information',
            'price',
            'cover_image',
            'size_chart_image',
            'size_chart_images',
            'image_gallery',
            'color',
            'color_variant_images',
            'color_variant_videos',
            'color_variant_size_charts',
            'size',
            'variant_rows',
            'available_products',
            'category_id',
            'subcategory_id',
            'grand_child_id',
            'show_on_best_sellers',
            'position',
        ];

        if (Schema::hasColumn('products', 'slug')) {
            $columns[] = 'slug';
        }

        $products = Product::select($columns)
            ->orderByRaw('position IS NULL')
            ->orderBy('position')
            ->orderByDesc('created_at')
            ->get()
            ->filter(function (Product $product): bool {
                $rows = is_array($product->variant_rows) ? $product->variant_rows : [];
                foreach ($rows as $row) {
                    if (! is_array($row)) {
                        continue;
                    }

                    $variantTrending = filter_var(
                        $row['show_on_best_sellers'] ?? false,
                        FILTER_VALIDATE_BOOLEAN,
                        FILTER_NULL_ON_FAILURE,
                    );

                    if ($variantTrending === true) {
                        return true;
                    }
                }

                return false;
            })
            ->values()
            ->take(24);

        return response()->json($products);
    }

    public function publicShopIndex(): JsonResponse
    {
        $columns = [
            'id',
            'name',
            'sku',
            'description',
            'fit',
            'fabric_and_care',
            'product_features',
            'product_composition',
            'long_description',
            'additional_information',
            'price',
            'cover_image',
            'size_chart_image',
            'size_chart_images',
            'image_gallery',
            'color',
            'color_variant_images',
            'color_variant_videos',
            'color_variant_size_charts',
            'size',
            'stock',
            'variant_rows',
            'grand_child_id',
            'show_on_best_sellers',
            'position',
        ];

        if (Schema::hasColumn('products', 'slug')) {
            $columns[] = 'slug';
        }

        $products = Product::query()
            ->select($columns)
            ->orderByRaw('position IS NULL')
            ->orderBy('position')
            ->orderByDesc('created_at')
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
        $this->normalizeJsonFields($request, ['variant_rows', 'color_variant_images', 'color_variant_videos', 'color_variant_size_charts', 'size_chart_images', 'product_features']);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:products,slug',
            'sku' => 'required|string|max:255',
            'color' => 'nullable|string|max:255',
            'size' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'fit' => 'nullable|string',
            'fabric_and_care' => 'nullable|string',
            'product_features' => 'nullable|array',
            'product_features.*.icon' => 'nullable|string|max:100',
            'product_features.*.text' => 'required|string|max:255',
            'product_composition' => 'nullable|string',
            'long_description' => 'nullable|string',
            'additional_information' => 'nullable|string',
            'price' => 'required|numeric',
            'cover_image' => 'nullable|string',
            'size_chart_image' => 'nullable|string',
            'size_chart_images' => 'nullable|array',
            'size_chart_images.*' => 'nullable|string|max:2048',
            'thumbnail_image' => 'nullable|image|mimes:jpeg,jpg,png,webp|max:4096',
            'size_chart_image_file' => 'nullable|image|mimes:jpeg,jpg,png,webp|max:4096',
            'size_chart_files' => 'nullable|array',
            'size_chart_files.*' => 'image|mimes:jpeg,jpg,png,webp|max:4096',
            'image_gallery' => 'nullable|array',
            'image_gallery.*' => 'image|mimes:jpeg,jpg,png,webp|max:4096',
            'product_videos' => 'nullable|array',
            'product_videos.*' => 'file|mimetypes:video/mp4,video/webm,video/ogg,video/quicktime|max:51200',
            'category_id' => 'nullable|integer',
            'subcategory_id' => 'nullable|integer',
            'grand_child_id' => 'nullable|integer',
            'stock' => 'required|integer',
            'position' => 'nullable|integer|min:1',
            'show_on_best_sellers' => 'nullable|boolean',
            'variant_rows' => 'nullable|array',
            'variant_rows.*.key' => 'nullable|string|max:255',
            'variant_rows.*.color' => 'nullable|string|max:255',
            'variant_rows.*.size' => 'nullable|string|max:255',
            'variant_rows.*.sku' => 'nullable|string|max:255',
            'variant_rows.*.stock' => 'nullable',
            'variant_rows.*.price' => 'nullable',
            'variant_rows.*.show_on_best_sellers' => 'nullable|boolean',
            'color_variant_images' => 'nullable|array',
            'color_variant_images.*' => 'nullable|array',
            'color_variant_images.*.*' => 'nullable|string|max:2048',
            'color_variant_videos' => 'nullable|array',
            'color_variant_videos.*' => 'nullable|array',
            'color_variant_videos.*.*' => 'nullable|string|max:2048',
            'color_variant_size_charts' => 'nullable|array',
            'color_variant_size_charts.*' => 'nullable|array',
            'color_variant_size_charts.*.*' => 'nullable|string|max:2048',
        ]);

        if ($request->hasFile('thumbnail_image')) {
            $validated['cover_image'] = $this->uploadThumbnailImage($request);
        }

        $uploadedSizeChartResult = $this->uploadSizeChartImages($request);

        $uploadedGallery = [];
        $uploadedNameMap = [];

        if ($request->hasFile('image_gallery')) {
            $uploadedGalleryResult = $this->uploadImageGallery($request);
            $uploadedGallery = $uploadedGalleryResult['paths'];
            $uploadedNameMap = $uploadedGalleryResult['name_map'];
            $validated['image_gallery'] = $uploadedGallery;
        }

        $uploadedVideoNameMap = [];

        if ($request->hasFile('product_videos')) {
            $uploadedVideosResult = $this->uploadProductVideos($request);
            $validated['product_videos'] = $uploadedVideosResult['paths'];
            $uploadedVideoNameMap = $uploadedVideosResult['name_map'];
        }

        $finalGallery = is_array($validated['image_gallery'] ?? null) ? $validated['image_gallery'] : [];
        $manualSizeCharts = array_values(array_filter(
            is_array($validated['size_chart_images'] ?? null) ? $validated['size_chart_images'] : [],
            static fn ($path): bool => is_string($path) && trim($path) !== '',
        ));
        $finalSizeCharts = array_values(array_unique(array_merge($manualSizeCharts, $uploadedSizeChartResult['paths'])));
        $validated['size_chart_images'] = $finalSizeCharts;
        $validated['size_chart_image'] = $finalSizeCharts[0] ?? null;
        $validated['color'] = $this->normalizeColorSelectionValue($validated['color'] ?? '');
        $validated['size'] = $this->normalizeSizeSelectionValue($validated['size'] ?? '');
        $validated['variant_rows'] = $this->normalizeVariantRows($validated['variant_rows'] ?? []);
        $validated['product_features'] = $this->normalizeProductFeatures($validated['product_features'] ?? []);
        $validated['show_on_best_sellers'] = $request->boolean('show_on_best_sellers');
        $validated['fit'] = trim((string) ($validated['fit'] ?? ($validated['long_description'] ?? '')));
        $validated['fabric_and_care'] = trim((string) ($validated['fabric_and_care'] ?? ($validated['additional_information'] ?? '')));
        $validated['long_description'] = $validated['fit'];
        $validated['additional_information'] = $validated['fabric_and_care'];

        if (!isset($validated['position']) || $validated['position'] === null || $validated['position'] === '') {
            $validated['position'] = (int) Product::query()->max('position') + 1;
        }

        $validated['color_variant_images'] = $this->resolveColorVariantImages(
            $validated['color_variant_images'] ?? [],
            $finalGallery,
            $uploadedNameMap,
        );
        $validated['color_variant_videos'] = $this->resolveColorVariantVideos(
            $validated['color_variant_videos'] ?? [],
            is_array($validated['product_videos'] ?? null) ? $validated['product_videos'] : [],
            $uploadedVideoNameMap,
        );
        $validated['color_variant_size_charts'] = $this->resolveColorVariantSizeCharts(
            $validated['color_variant_size_charts'] ?? [],
            $finalSizeCharts,
            $uploadedSizeChartResult['name_map'],
        );

        $existingProductWithSku = Product::query()
            ->where('sku', $validated['sku'])
            ->first(['id']);

        $validated['slug'] = $this->resolveProductSlug(
            $validated['slug'] ?? null,
            $validated['name'] ?? '',
            $existingProductWithSku?->id,
        );

        $product = Product::query()->updateOrCreate(
            ['sku' => $validated['sku']],
            $validated,
        );

        return response()->json([
            'message' => $product->wasRecentlyCreated
                ? 'Product created successfully'
                : 'Product updated successfully (matched by SKU)',
            'product' => $product,
        ], $product->wasRecentlyCreated ? 201 : 200);
    }

    public function update(Request $request, Product $product): JsonResponse
    {
        $this->normalizeBooleanFields($request, ['show_on_best_sellers', 'clear_gallery', 'clear_videos', 'clear_size_charts']);
        $this->normalizeJsonFields($request, ['variant_rows', 'color_variant_images', 'color_variant_videos', 'color_variant_size_charts', 'size_chart_images', 'product_features', 'image_gallery_existing', 'product_videos_existing', 'size_chart_images_existing']);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:products,slug,' . $product->id,
            'sku' => 'required|string|max:255',
            'color' => 'nullable|string|max:255',
            'size' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'fit' => 'nullable|string',
            'fabric_and_care' => 'nullable|string',
            'product_features' => 'nullable|array',
            'product_features.*.icon' => 'nullable|string|max:100',
            'product_features.*.text' => 'required|string|max:255',
            'product_composition' => 'nullable|string',
            'long_description' => 'nullable|string',
            'additional_information' => 'nullable|string',
            'price' => 'required|numeric',
            'cover_image' => 'nullable|string',
            'size_chart_image' => 'nullable|string',
            'size_chart_images' => 'nullable|array',
            'size_chart_images.*' => 'nullable|string|max:2048',
            'thumbnail_image' => 'nullable|image|mimes:jpeg,jpg,png,webp|max:4096',
            'size_chart_image_file' => 'nullable|image|mimes:jpeg,jpg,png,webp|max:4096',
            'size_chart_files' => 'nullable|array',
            'size_chart_files.*' => 'image|mimes:jpeg,jpg,png,webp|max:4096',
            'size_chart_images_existing' => 'nullable|array',
            'size_chart_images_existing.*' => 'nullable|string',
            'clear_size_charts' => 'nullable|boolean',
            'image_gallery' => 'nullable|array',
            'image_gallery.*' => 'image|mimes:jpeg,jpg,png,webp|max:4096',
            'image_gallery_existing' => 'nullable|array',
            'image_gallery_existing.*' => 'nullable|string',
            'clear_gallery' => 'nullable|boolean',
            'product_videos' => 'nullable|array',
            'product_videos.*' => 'file|mimetypes:video/mp4,video/webm,video/ogg,video/quicktime|max:51200',
            'product_videos_existing' => 'nullable|array',
            'product_videos_existing.*' => 'nullable|string',
            'clear_videos' => 'nullable|boolean',
            'category_id' => 'nullable|integer',
            'subcategory_id' => 'nullable|integer',
            'grand_child_id' => 'nullable|integer',
            'stock' => 'required|integer',
            'position' => 'nullable|integer|min:1',
            'show_on_best_sellers' => 'nullable|boolean',
            'variant_rows' => 'nullable|array',
            'variant_rows.*.key' => 'nullable|string|max:255',
            'variant_rows.*.color' => 'nullable|string|max:255',
            'variant_rows.*.size' => 'nullable|string|max:255',
            'variant_rows.*.sku' => 'nullable|string|max:255',
            'variant_rows.*.stock' => 'nullable',
            'variant_rows.*.price' => 'nullable',
            'variant_rows.*.show_on_best_sellers' => 'nullable|boolean',
            'color_variant_images' => 'nullable|array',
            'color_variant_images.*' => 'nullable|array',
            'color_variant_images.*.*' => 'nullable|string|max:2048',
            'color_variant_videos' => 'nullable|array',
            'color_variant_videos.*' => 'nullable|array',
            'color_variant_videos.*.*' => 'nullable|string|max:2048',
            'color_variant_size_charts' => 'nullable|array',
            'color_variant_size_charts.*' => 'nullable|array',
            'color_variant_size_charts.*.*' => 'nullable|string|max:2048',
        ]);

        if ($request->hasFile('thumbnail_image')) {
            $validated['cover_image'] = $this->uploadThumbnailImage($request, $product->cover_image);
        } elseif (! isset($validated['cover_image']) || trim((string) $validated['cover_image']) === '') {
            unset($validated['cover_image']);
        }

        $existingSizeCharts = $request->boolean('clear_size_charts')
            ? []
            : (is_array($request->input('size_chart_images_existing'))
                ? $request->input('size_chart_images_existing')
                : (is_array($product->size_chart_images ?? null)
                    ? $product->size_chart_images
                    : array_values(array_filter([$product->size_chart_image]))));

        $uploadedSizeChartResult = $this->uploadSizeChartImages($request);
        $manualSizeCharts = array_values(array_filter(
            is_array($validated['size_chart_images'] ?? null) ? $validated['size_chart_images'] : [],
            static fn ($path): bool => is_string($path) && trim($path) !== '',
        ));

        $finalSizeCharts = array_values(array_unique(array_merge(
            is_array($existingSizeCharts) ? $existingSizeCharts : [],
            $manualSizeCharts,
            $uploadedSizeChartResult['paths'],
        )));

        $validated['size_chart_images'] = $finalSizeCharts;
        $validated['size_chart_image'] = $finalSizeCharts[0] ?? null;

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
        } elseif ($request->boolean('clear_gallery')) {
            $validated['image_gallery'] = [];
        } elseif ($request->has('image_gallery_existing') && is_array($request->input('image_gallery_existing')) && $request->input('image_gallery_existing') !== []) {
            $validated['image_gallery'] = array_values(array_filter(is_array($existingGallery) ? $existingGallery : []));
        }

        $existingVideos = $request->boolean('clear_videos')
            ? []
            : (is_array($request->input('product_videos_existing')) ? $request->input('product_videos_existing') : ($product->product_videos ?? []));

        $uploadedVideoNameMap = [];

        if ($request->hasFile('product_videos')) {
            $uploadedVideosResult = $this->uploadProductVideos($request);
            $uploadedVideos = $uploadedVideosResult['paths'];
            $uploadedVideoNameMap = $uploadedVideosResult['name_map'];
            $validated['product_videos'] = array_values(array_filter(array_merge(
                is_array($existingVideos) ? $existingVideos : [],
                $uploadedVideos,
            )));
        } elseif ($request->boolean('clear_videos')) {
            $validated['product_videos'] = [];
        } elseif ($request->has('product_videos_existing') && is_array($request->input('product_videos_existing'))) {
            $validated['product_videos'] = array_values(array_filter(is_array($existingVideos) ? $existingVideos : []));
        }

        $finalGallery = is_array($validated['image_gallery'] ?? null)
            ? $validated['image_gallery']
            : (is_array($product->image_gallery ?? null) ? $product->image_gallery : []);

        $validated['color'] = $this->normalizeColorSelectionValue($validated['color'] ?? ($product->color ?? ''));
        $validated['size'] = $this->normalizeSizeSelectionValue($validated['size'] ?? ($product->size ?? ''));
        $validated['variant_rows'] = $this->normalizeVariantRows($validated['variant_rows'] ?? ($product->variant_rows ?? []));
        $validated['product_features'] = $this->normalizeProductFeatures($validated['product_features'] ?? ($product->product_features ?? []));
        $validated['show_on_best_sellers'] = $request->boolean('show_on_best_sellers');
        $validated['fit'] = trim((string) ($validated['fit'] ?? ($validated['long_description'] ?? ($product->fit ?? ''))));
        $validated['fabric_and_care'] = trim((string) ($validated['fabric_and_care'] ?? ($validated['additional_information'] ?? ($product->fabric_and_care ?? ''))));
        $validated['long_description'] = $validated['fit'];
        $validated['additional_information'] = $validated['fabric_and_care'];
        $validated['color_variant_images'] = $this->resolveColorVariantImages(
            $validated['color_variant_images'] ?? ($product->color_variant_images ?? []),
            $finalGallery,
            $uploadedNameMap,
        );
        $validated['color_variant_videos'] = $this->resolveColorVariantVideos(
            $validated['color_variant_videos'] ?? ($product->color_variant_videos ?? []),
            is_array($validated['product_videos'] ?? null)
                ? $validated['product_videos']
                : (is_array($product->product_videos ?? null) ? $product->product_videos : []),
            $uploadedVideoNameMap,
        );
        $validated['color_variant_size_charts'] = $this->resolveColorVariantSizeCharts(
            $validated['color_variant_size_charts'] ?? ($product->color_variant_size_charts ?? []),
            $finalSizeCharts,
            $uploadedSizeChartResult['name_map'],
        );
        $validated['slug'] = $this->resolveProductSlug(
            $validated['slug'] ?? null,
            $validated['name'] ?? '',
            $product->id,
        );

        $oldGallery = is_array($product->image_gallery ?? null) ? $product->image_gallery : [];
        $oldVideos = is_array($product->product_videos ?? null) ? $product->product_videos : [];
        $oldSizeCharts = is_array($product->size_chart_images ?? null)
            ? $product->size_chart_images
            : array_values(array_filter([$product->size_chart_image]));

        $product->update($validated);

        if (array_key_exists('image_gallery', $validated)) {
            $this->deleteRemovedUploadedFiles(
                $oldGallery,
                is_array($validated['image_gallery']) ? $validated['image_gallery'] : [],
            );
        }

        if (array_key_exists('product_videos', $validated)) {
            $this->deleteRemovedUploadedFiles(
                $oldVideos,
                is_array($validated['product_videos']) ? $validated['product_videos'] : [],
            );
        }

        if (array_key_exists('size_chart_images', $validated)) {
            $this->deleteRemovedUploadedFiles(
                $oldSizeCharts,
                is_array($validated['size_chart_images']) ? $validated['size_chart_images'] : [],
            );
        }

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

    public function reorder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|integer|exists:products,id',
            'items.*.position' => 'required|integer|min:1',
        ]);

        DB::transaction(function () use ($validated): void {
            foreach ($validated['items'] as $item) {
                Product::query()
                    ->whereKey($item['id'])
                    ->update(['position' => (int) $item['position']]);
            }
        });

        return response()->json([
            'message' => 'Product order updated successfully.',
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

    private function uploadSizeChartImage(Request $request, ?string $existingPath = null): ?string
    {
        if (! $request->hasFile('size_chart_image_file')) {
            return $existingPath;
        }

        $storedPath = $this->storeUploadedFileToPublic(
            $request->file('size_chart_image_file'),
            'uploads/products/size-charts',
        );

        $this->deleteUploadedFile($existingPath);

        return $storedPath;
    }

    private function uploadSizeChartImages(Request $request): array
    {
        $uploaded = [];
        $nameMap = [];

        if ($request->hasFile('size_chart_files')) {
            $files = $request->file('size_chart_files');

            foreach ($files as $file) {
                if (! $file) {
                    continue;
                }

                $originalName = (string) $file->getClientOriginalName();
                $publicPath = $this->storeUploadedFileToPublic($file, 'uploads/products/size-charts');
                $uploaded[] = $publicPath;

                if ($originalName !== '') {
                    $nameMap[$originalName] = $publicPath;
                }
            }
        }

        if ($request->hasFile('size_chart_image_file')) {
            $file = $request->file('size_chart_image_file');
            if ($file) {
                $originalName = (string) $file->getClientOriginalName();
                $publicPath = $this->storeUploadedFileToPublic($file, 'uploads/products/size-charts');
                $uploaded[] = $publicPath;

                if ($originalName !== '') {
                    $nameMap[$originalName] = $publicPath;
                }
            }
        }

        return [
            'paths' => array_values(array_unique($uploaded)),
            'name_map' => $nameMap,
        ];
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

    private function uploadProductVideos(Request $request): array
    {
        if (! $request->hasFile('product_videos')) {
            return ['paths' => [], 'name_map' => []];
        }

        $files = $request->file('product_videos');
        $uploaded = [];
        $nameMap = [];

        foreach ($files as $file) {
            if (! $file) {
                continue;
            }

            $originalName = (string) $file->getClientOriginalName();
            $publicPath = $this->storeUploadedFileToPublic($file, 'uploads/products/videos');
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

    private function deleteRemovedUploadedFiles(array $previous, array $next): void
    {
        $nextSet = array_fill_keys(array_values(array_filter($next, 'is_string')), true);

        foreach ($previous as $path) {
            if (! is_string($path) || trim($path) === '') {
                continue;
            }

            if (! isset($nextSet[$path])) {
                $this->deleteUploadedFile($path);
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

        return array_values(array_map(function ($row): array {
            if (! is_array($row)) {
                return [];
            }

            return [
                'key' => (string) ($row['key'] ?? ''),
                'color' => $this->normalizeColorSelectionValue($row['color'] ?? ''),
                'size' => $this->normalizeSizeSelectionValue($row['size'] ?? ''),
                'sku' => (string) ($row['sku'] ?? ''),
                'stock' => $row['stock'] ?? '',
                'price' => $row['price'] ?? '',
                'show_on_best_sellers' => filter_var(
                    $row['show_on_best_sellers'] ?? false,
                    FILTER_VALIDATE_BOOLEAN,
                    FILTER_NULL_ON_FAILURE,
                ) === true,
            ];
        }, $variantRows));
    }

    private function normalizeProductFeatures($features): array
    {
        if (! is_array($features)) {
            return [];
        }

        $rows = [];

        foreach ($features as $row) {
            if (! is_array($row)) {
                continue;
            }

            $text = trim((string) ($row['text'] ?? ''));
            if ($text === '') {
                continue;
            }

            $icon = trim((string) ($row['icon'] ?? 'sparkles'));

            $rows[] = [
                'icon' => $icon !== '' ? $icon : 'sparkles',
                'text' => $text,
            ];
        }

        return array_values($rows);
    }

    private function normalizeColorSelectionValue($value): string
    {
        return $this->normalizeSelectionValueToIds(
            $value,
            static fn (string $token): ?string => Color::query()->whereRaw('LOWER(name) = ?', [strtolower($token)])->value('id')
        );
    }

    private function normalizeSizeSelectionValue($value): string
    {
        return $this->normalizeSelectionValueToIds(
            $value,
            static fn (string $token): ?string => Size::query()->whereRaw('LOWER(size) = ?', [strtolower($token)])->value('id')
        );
    }

    private function normalizeSelectionValueToIds($value, callable $lookupIdByName): string
    {
        $parts = array_values(array_filter(array_map(static function ($item): string {
            return trim(trim((string) $item), "\"'");
        }, explode(',', (string) $value)), static function ($item): bool {
            return $item !== '';
        }));

        if ($parts === []) {
            return '';
        }

        $ids = [];
        foreach ($parts as $token) {
            if (ctype_digit($token)) {
                $ids[] = $token;
                continue;
            }

            $plainToken = preg_replace('/\s*\([^)]*\)\s*$/', '', $token) ?? $token;
            $resolved = $lookupIdByName($token) ?? $lookupIdByName($plainToken);
            if ($resolved !== null && $resolved !== '') {
                $ids[] = (string) $resolved;
            }
        }

        return implode(', ', array_values(array_unique($ids)));
    }

    private function resolveColorVariantImages($mapping, array $finalGallery, array $uploadedNameMap = []): array
    {
        if (! is_array($mapping)) {
            return [];
        }

        $finalGalleryByNormalized = [];
        $finalGalleryByBasename = [];

        foreach ($finalGallery as $path) {
            if (! is_string($path) || trim($path) === '') {
                continue;
            }

            $normalized = $this->normalizePublicMediaPath($path);
            if ($normalized !== null) {
                $finalGalleryByNormalized[$normalized] = $normalized;
                $finalGalleryByBasename[basename($normalized)] = $normalized;
            }
        }

        $resolved = [];

        foreach ($mapping as $color => $items) {
            if (! is_array($items) || trim((string) $color) === '') {
                continue;
            }

            $normalizedColor = $this->normalizeColorSelectionValue((string) $color);
            $targetColorKey = $normalizedColor !== '' ? $normalizedColor : trim((string) $color);
            $paths = [];

            foreach ($items as $item) {
                if (! is_string($item) || trim($item) === '') {
                    continue;
                }

                $raw = trim($item);

                $candidates = [$raw];
                if (isset($uploadedNameMap[$raw])) {
                    $candidates[] = (string) $uploadedNameMap[$raw];
                }

                foreach ($candidates as $candidate) {
                    $normalizedCandidate = $this->normalizePublicMediaPath($candidate);
                    if ($normalizedCandidate === null) {
                        continue;
                    }

                    if (isset($finalGalleryByNormalized[$normalizedCandidate])) {
                        $paths[] = $finalGalleryByNormalized[$normalizedCandidate];
                        continue 2;
                    }

                    $filename = basename($normalizedCandidate);
                    if ($filename !== '' && isset($finalGalleryByBasename[$filename])) {
                        $paths[] = $finalGalleryByBasename[$filename];
                        continue 2;
                    }
                }
            }

            $paths = array_values(array_unique($paths));
            if ($paths !== []) {
                $resolved[$targetColorKey] = $paths;
            }
        }

        return $resolved;
    }

    private function resolveColorVariantVideos($mapping, array $finalVideos, array $uploadedNameMap = []): array
    {
        if (! is_array($mapping)) {
            return [];
        }

        $finalVideosByNormalized = [];
        $finalVideosByBasename = [];

        foreach ($finalVideos as $path) {
            if (! is_string($path) || trim($path) === '') {
                continue;
            }

            $normalized = $this->normalizePublicMediaPath($path);
            if ($normalized !== null) {
                $finalVideosByNormalized[$normalized] = $normalized;
                $finalVideosByBasename[basename($normalized)] = $normalized;
            }
        }

        $resolved = [];

        foreach ($mapping as $color => $items) {
            if (! is_array($items) || trim((string) $color) === '') {
                continue;
            }

            $normalizedColor = $this->normalizeColorSelectionValue((string) $color);
            $targetColorKey = $normalizedColor !== '' ? $normalizedColor : trim((string) $color);
            $paths = [];

            foreach ($items as $item) {
                if (! is_string($item) || trim($item) === '') {
                    continue;
                }

                $raw = trim($item);

                $candidates = [$raw];
                if (isset($uploadedNameMap[$raw])) {
                    $candidates[] = (string) $uploadedNameMap[$raw];
                }

                foreach ($candidates as $candidate) {
                    $normalizedCandidate = $this->normalizePublicMediaPath($candidate);
                    if ($normalizedCandidate === null) {
                        continue;
                    }

                    if (isset($finalVideosByNormalized[$normalizedCandidate])) {
                        $paths[] = $finalVideosByNormalized[$normalizedCandidate];
                        continue 2;
                    }

                    $filename = basename($normalizedCandidate);
                    if ($filename !== '' && isset($finalVideosByBasename[$filename])) {
                        $paths[] = $finalVideosByBasename[$filename];
                        continue 2;
                    }
                }
            }

            $paths = array_values(array_unique($paths));
            if ($paths !== []) {
                $resolved[$targetColorKey] = $paths;
            }
        }

        return $resolved;
    }

    private function resolveColorVariantSizeCharts($mapping, array $finalSizeCharts, array $uploadedNameMap = []): array
    {
        if (! is_array($mapping)) {
            return [];
        }

        $finalByNormalized = [];
        $finalByBasename = [];

        foreach ($finalSizeCharts as $path) {
            if (! is_string($path) || trim($path) === '') {
                continue;
            }

            $normalized = $this->normalizePublicMediaPath($path);
            if ($normalized !== null) {
                $finalByNormalized[$normalized] = $normalized;
                $finalByBasename[basename($normalized)] = $normalized;
            }
        }

        $resolved = [];

        foreach ($mapping as $color => $items) {
            if (! is_array($items) || trim((string) $color) === '') {
                continue;
            }

            $normalizedColor = $this->normalizeColorSelectionValue((string) $color);
            $targetColorKey = $normalizedColor !== '' ? $normalizedColor : trim((string) $color);
            $paths = [];

            foreach ($items as $item) {
                if (! is_string($item) || trim($item) === '') {
                    continue;
                }

                $raw = trim($item);
                $candidates = [$raw];
                if (isset($uploadedNameMap[$raw])) {
                    $candidates[] = (string) $uploadedNameMap[$raw];
                }

                foreach ($candidates as $candidate) {
                    $normalizedCandidate = $this->normalizePublicMediaPath($candidate);
                    if ($normalizedCandidate === null) {
                        continue;
                    }

                    if (isset($finalByNormalized[$normalizedCandidate])) {
                        $paths[] = $finalByNormalized[$normalizedCandidate];
                        continue 2;
                    }

                    $filename = basename($normalizedCandidate);
                    if ($filename !== '' && isset($finalByBasename[$filename])) {
                        $paths[] = $finalByBasename[$filename];
                        continue 2;
                    }
                }
            }

            $paths = array_values(array_unique($paths));
            if ($paths !== []) {
                $resolved[$targetColorKey] = $paths;
            }
        }

        return $resolved;
    }

    private function normalizePublicMediaPath(string $path): ?string
    {
        $raw = trim($path);
        if ($raw === '') {
            return null;
        }

        $parsed = parse_url($raw, PHP_URL_PATH);
        $normalized = is_string($parsed) && $parsed !== '' ? $parsed : $raw;
        $normalized = str_replace('\\', '/', $normalized);
        $normalized = '/' . ltrim($normalized, '/');

        return $normalized !== '/' ? $normalized : null;
    }

    private function resolveProductSlug(?string $requestedSlug, string $productName, ?int $ignoreProductId = null): string
    {
        $source = trim((string) $requestedSlug);
        if ($source === '') {
            $source = trim((string) $productName);
        }

        $baseSlug = Str::slug($source);
        if ($baseSlug === '') {
            $baseSlug = 'product';
        }

        $slug = $baseSlug;
        $counter = 2;

        while ($this->productSlugExists($slug, $ignoreProductId)) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }

    private function productSlugExists(string $slug, ?int $ignoreProductId = null): bool
    {
        $query = Product::query()->where('slug', $slug);

        if ($ignoreProductId !== null) {
            $query->where('id', '!=', $ignoreProductId);
        }

        return $query->exists();
    }
}