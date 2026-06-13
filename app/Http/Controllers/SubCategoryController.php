<?php

namespace App\Http\Controllers;

use App\Models\SubCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SubCategoryController extends Controller
{
    private function toResponseArray(SubCategory $subCategory): array
    {
        $data = $subCategory->toArray();
        $data['image_url'] = $subCategory->image ? Storage::url($subCategory->image) : null;

        return $data;
    }

    public function index(): JsonResponse
    {
        $subcategories = SubCategory::query()
            ->with('category')
            ->orderBy('id')
            ->get()
            ->map(fn (SubCategory $subCategory) => $this->toResponseArray($subCategory));

        return response()->json($subcategories);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:sub_categories,slug'],
            'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:2048'],
            'category_id' => ['required', 'exists:categories,id'],
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('subcategories/images', 'public');
        }

        $subcategory = SubCategory::query()->create($validated)->load('category');

        return response()->json($this->toResponseArray($subcategory), 201);
    }

    public function show(SubCategory $sub_category): JsonResponse
    {
        return response()->json($this->toResponseArray($sub_category->load('category')));
    }

    public function update(Request $request, SubCategory $sub_category): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:sub_categories,slug,' . $sub_category->id],
            'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:2048'],
            'category_id' => ['required', 'exists:categories,id'],
        ]);

        if ($request->hasFile('image')) {
            if ($sub_category->image) {
                Storage::disk('public')->delete($sub_category->image);
            }

            $validated['image'] = $request->file('image')->store('subcategories/images', 'public');
        }

        $sub_category->update($validated);

        return response()->json($this->toResponseArray($sub_category->fresh()->load('category')));
    }

    public function destroy(SubCategory $sub_category): JsonResponse
    {
        if ($sub_category->image) {
            Storage::disk('public')->delete($sub_category->image);
        }

        $sub_category->delete();

        return response()->json(null, 204);
    }
}