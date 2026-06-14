<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProductController extends Controller
{
    public function index(): JsonResponse
    {
        $products = Product::all();
       
        return response()->json($products);
    }

    public function publicIndex(): JsonResponse
    {
        $products = Product::select('id', 'name', 'price', 'cover_image', 'color', 'slug', 'category_id', 'subcategory_id')
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
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'required|string|max:255',
            'color' => 'nullable|string|max:255',
            'size' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric',
            'cover_image' => 'nullable|string',
            'category_id' => 'nullable|integer',
            'subcategory_id' => 'nullable|integer',
            'stock' => 'required|integer',
        ]);
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
            'category_id' => 'nullable|integer',
            'subcategory_id' => 'nullable|integer',
            'stock' => 'required|integer',
        ]);
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
}
