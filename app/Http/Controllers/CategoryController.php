<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;

class CategoryController extends Controller
{
    private function toResponseArray(Category $category): array
    {
        $data = $category->toArray();
        $data['image_url'] = $category->image ? '/' . ltrim($category->image, '/') : null;

        return $data;
    }

    
    public function index():JsonResponse
    {
        $categories = Category::query()
            ->orderBy('id')
            ->get()
            ->map(fn (Category $category) => $this->toResponseArray($category));

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
            $image = $request->file('image');
            $imageDirectory = public_path('uploads/category');
            File::ensureDirectoryExists($imageDirectory);
            $imageName = time() . '_' . uniqid() . '_category.' . $image->getClientOriginalExtension();
            $image->move($imageDirectory, $imageName);
            $validated['image'] = 'uploads/category/' . $imageName;
        }

        $validated['show_homepage'] = $request->boolean('show_homepage');
        $category =Category::query()->create($validated);
        return response()->json($this->toResponseArray($category),201);
    }

    public function show (Category $category): JsonResponse
    {
        return response()->json($this->toResponseArray($category));
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

            $image = $request->file('image');
            $imageDirectory = public_path('uploads/category');
            File::ensureDirectoryExists($imageDirectory);
            $imageName = time() . '_' . uniqid() . '_category.' . $image->getClientOriginalExtension();
            $image->move($imageDirectory, $imageName);
            $validated['image'] = 'uploads/category/' . $imageName;
        }

        $validated['show_homepage'] = $request->boolean('show_homepage');
        $category->update($validated);
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
        return response()->json(null,204);
    }
}
  