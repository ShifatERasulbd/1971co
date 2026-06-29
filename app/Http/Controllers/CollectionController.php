<?php

namespace App\Http\Controllers;

use App\Models\CollectionSection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

class CollectionController extends Controller
{
    private function hasProductIdsColumn(): bool
    {
        return Schema::hasTable('collection_items') && Schema::hasColumn('collection_items', 'product_ids');
    }

    private function normalizeProductIds(mixed $value): array
    {
        if (! $this->hasProductIdsColumn()) {
            return [];
        }

        if (is_string($value)) {
            $decoded = json_decode(trim($value), true);

            if (json_last_error() === JSON_ERROR_NONE) {
                $value = $decoded;
            }
        }

        return array_values(array_unique(array_map(
            'intval',
            is_array($value) ? $value : [],
        )));
    }

    private function resolveProductIds(mixed $item): array
    {
        if (! is_object($item) && ! is_array($item)) {
            return [];
        }

        $productIds = is_array($item)
            ? ($item['product_ids'] ?? $item['productIds'] ?? [])
            : ($item->product_ids ?? $item->productIds ?? []);

        return array_values(array_filter(
            $this->normalizeProductIds($productIds),
            static fn (int $value): bool => $value > 0,
        ));
    }

    private function resolveImageUrl(?string $image): ?string
    {
        if (!$image) {
            return null;
        }

        if (
            str_starts_with($image, 'http://') ||
            str_starts_with($image, 'https://') ||
            str_starts_with($image, 'data:')
        ) {
            return $image;
        }

        if (str_starts_with($image, '/')) {
            return $image;
        }

        if (File::exists(public_path($image))) {
            return '/' . ltrim($image, '/');
        }

        return Storage::url($image);
    }

    private function ensureSection(): CollectionSection
    {
        $section = CollectionSection::query()->with('items')->first();
        $hasProductIdsColumn = $this->hasProductIdsColumn();

        if (!$section) {
            $section = CollectionSection::query()->create([
                'title' => 'Collections',
                'title_position' => 'left',
                'items_per_view' => 4,
            ]);
        }

        if ($section->items()->count() === 0) {
            $defaultItems = [
                [
                    'name' => 'New Arrivals',
                    'slug' => 'new-arrivals',
                    'image' => '/uploads/heroes/images/hero1.webp',
                    'sort_order' => 0,
                ],
                [
                    'name' => 'Essentials',
                    'slug' => 'essentials',
                    'image' => '/uploads/heroes/images/hero1.webp',
                    'sort_order' => 1,
                ],
                [
                    'name' => 'Tees',
                    'slug' => 'tees',
                    'image' => '/uploads/heroes/images/hero1.webp',
                    'sort_order' => 2,
                ],
                [
                    'name' => 'Bottoms',
                    'slug' => 'bottoms',
                    'image' => '/uploads/heroes/images/hero1.webp',
                    'sort_order' => 3,
                ],
            ];

            if ($hasProductIdsColumn) {
                $defaultItems = array_map(function (array $item): array {
                    $item['product_ids'] = [];
                    return $item;
                }, $defaultItems);
            }

            $section->items()->createMany($defaultItems);
        }

        return $section->fresh('items');
    }

    private function toResponse(CollectionSection $section): array
    {
        $hasProductIdsColumn = $this->hasProductIdsColumn();

        return [
            'section' => [
                'id' => $section->id,
                'title' => $section->title,
                'titlePosition' => $section->title_position,
                'itemsPerView' => $section->items_per_view,
            ],
            'items' => $section->items
                ->sortBy('sort_order')
                ->values()
                ->map(fn ($item) => [
                    'id' => $item->id,
                    'name' => $item->name,
                    'slug' => $item->slug,
                    'image' => $this->resolveImageUrl($item->image),
                    'productIds' => $hasProductIdsColumn ? $this->resolveProductIds($item) : [],
                    'product_ids' => $hasProductIdsColumn ? $this->resolveProductIds($item) : [],
                    'sort_order' => $item->sort_order,
                ]),
        ];
    }

    public function index(): JsonResponse
    {
        $section = $this->ensureSection();

        return response()->json($this->toResponse($section));
    }

    public function publicIndex(): JsonResponse
    {
        return $this->index();
    }

    public function update(Request $request): JsonResponse
    {
        $hasProductIdsColumn = $this->hasProductIdsColumn();

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'titlePosition' => ['required', 'in:left,center,right'],
            'itemsPerView' => ['required', 'integer', 'min:1', 'max:6'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.id' => ['nullable', 'integer'],
            'items.*.name' => ['required', 'string', 'max:255'],
            'items.*.slug' => ['required', 'string', 'max:255'],
            'items.*.image' => ['nullable', 'string'],
                'items.*.productIds' => ['nullable', 'array'],
                'items.*.productIds.*' => ['integer', 'exists:products,id'],
                'items.*.product_ids' => ['nullable', 'array'],
                'items.*.product_ids.*' => ['integer', 'exists:products,id'],
        ]);

        $section = $this->ensureSection();

        $section->update([
            'title' => $validated['title'],
            'title_position' => $validated['titlePosition'],
            'items_per_view' => $validated['itemsPerView'],
        ]);

        $existingIds = $section->items()->pluck('id')->all();
        $usedIds = [];

        foreach ($validated['items'] as $index => $item) {
            $itemId = isset($item['id']) ? (int) $item['id'] : null;

            if ($itemId && in_array($itemId, $existingIds, true)) {
                $collectionItem = $section->items()->find($itemId);
                if ($collectionItem) {
                    $payload = [
                        'name' => $item['name'],
                        'slug' => $item['slug'],
                        'image' => $item['image'] ?? null,
                        'sort_order' => $index,
                    ];

                    if ($hasProductIdsColumn) {
                            $payload['product_ids'] = $this->normalizeProductIds(
                                $item['productIds'] ?? $item['product_ids'] ?? null
                            );
                    }

                    $collectionItem->update($payload);
                    $usedIds[] = $collectionItem->id;
                }
                continue;
            }

            $payload = [
                'name' => $item['name'],
                'slug' => $item['slug'],
                'image' => $item['image'] ?? null,
                'sort_order' => $index,
            ];

            if ($hasProductIdsColumn) {
                    $payload['product_ids'] = $this->normalizeProductIds(
                        $item['productIds'] ?? $item['product_ids'] ?? null
                    );
            }

            $created = $section->items()->create($payload);
            $usedIds[] = $created->id;
        }

        if (!empty($existingIds)) {
            $section->items()->whereNotIn('id', $usedIds)->delete();
        }

        return response()->json($this->toResponse($section->fresh('items')));
    }
}
