<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    
    public function index():JsonResponse
    {
        $categories = Category::query()->orderBy('id')->get();

        return response()->json($categories);
    }

    public function store(Request $request): JsonResponse
    {
        $validated =$request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:categories,slug'],
            'show_homepage' => ['nullable', 'boolean'],
        ]);
        $validated['show_homepage'] = $request->boolean('show_homepage');
        $category =Category::query()->create($validated);
        return response()->json($category,201);
    }

    public function show (Category $category): JsonResponse
    {
        return response()->json($category);
    }

    public function update(Request $request, Category $category): JsonResponse
    {
        $validated =$request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:categories,slug,' . $category->id],
            'show_homepage' => ['nullable', 'boolean'],
        ]);
        $validated['show_homepage'] = $request->boolean('show_homepage');
        $category->update($validated);
        return response()->json($category);
    }

    public function destroy(Category $category): JsonResponse
    {
        $category->delete();
        return response()->json(null,204);
    }
}
  