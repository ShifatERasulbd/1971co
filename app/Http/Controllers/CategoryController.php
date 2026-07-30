<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Support\ImageUploadOptimizer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class CategoryController extends Controller
{
    private const INDEX_CACHE_KEY = 'categories.index';

    public function __construct(private readonly ImageUploadOptimizer $imageUploadOptimizer)
    {
    }

    private function toResponseArray(Category $category): array
    {
        $data = $category->toArray();
        $data['image_url'] = $category->image ? '/' . ltrim($category->image, '/') : null;

        return $data;
    }

    private function categoryCacheKey(int $categoryId): string
    {
        return 'categories.show.' . $categoryId;
    }

    private function clearCategoryCache(?int $categoryId = null): void
    {
        Cache::forget(self::INDEX_CACHE_KEY);

        if ($categoryId !== null) {
            Cache::forget($this->categoryCacheKey($categoryId));
        }
    }

    
    public function index():JsonResponse
    {
        $categories = Cache::rememberForever(self::INDEX_CACHE_KEY, function () {
            return Category::query()
                ->orderBy('id')
                ->get()
                ->map(fn (Category $category) => $this->toResponseArray($category))
                ->values()
                ->all();
        });

        return response()->json($categories);
    }

    public function store(Request $request): JsonResponse
    {
        $validated =$request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:categories,slug'],
            'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:2048'],
            'show_homepage' => ['nullable', 'boolean'],
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = ltrim(
                $this->imageUploadOptimizer->storeAsWebp(
                    $request->file('image'),
                    'uploads/category',
                    'category_',
                    1600,
                    1600,
                    80
                ),
                '/'
            );
        }

        $validated['show_homepage'] = $request->boolean('show_homepage');
        $category = Category::query()->create($validated);
        $this->clearCategoryCache($category->id);

        return response()->json($this->toResponseArray($category),201);
    }

    public function show(int $categoryId): JsonResponse
    {
        $category = Cache::rememberForever($this->categoryCacheKey($categoryId), function () use ($categoryId) {
            $foundCategory = Category::query()->find($categoryId);

            return $foundCategory ? $this->toResponseArray($foundCategory) : null;
        });

        if ($category === null) {
            return response()->json(['message' => 'Category not found.'], 404);
        }

        return response()->json($category);
    }

    public function update(Request $request, Category $category): JsonResponse
    {
        $validated =$request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:categories,slug,' . $category->id],
            'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:2048'],
            'show_homepage' => ['nullable', 'boolean'],
        ]);

        if ($request->hasFile('image')) {
            if ($category->image) {
                $existingImagePath = public_path($category->image);
                if (file_exists($existingImagePath)) {
                    unlink($existingImagePath);
                }
            }

            $validated['image'] = ltrim(
                $this->imageUploadOptimizer->storeAsWebp(
                    $request->file('image'),
                    'uploads/category',
                    'category_',
                    1600,
                    1600,
                    80
                ),
                '/'
            );
        }

        $validated['show_homepage'] = $request->boolean('show_homepage');
        $category->update($validated);
        $this->clearCategoryCache($category->id);

        return response()->json($this->toResponseArray($category->fresh()));
    }

    public function destroy(Category $category): JsonResponse
    {
        if ($category->image) {
            $existingImagePath = public_path($category->image);
            if (file_exists($existingImagePath)) {
                unlink($existingImagePath);
            }
        }

        $category->delete();
        $this->clearCategoryCache($category->id);

        return response()->json(null,204);
    }
}
  