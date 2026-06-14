<?php

namespace App\Http\Controllers;

use App\Models\GrandChilds;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class GrandChildController extends Controller
{
    public function index(): JsonResponse
    {
        $grandChilds = GrandChilds::query()
            ->with(['category', 'subCategory'])
            ->orderBy('id')
            ->get();

        return response()->json($grandChilds);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:grand_childs,slug'],
            'sub_category_id' => ['required', 'exists:sub_categories,id'],
            'category_id' => ['nullable', 'exists:categories,id'],
        ]);

        $validated['child_id'] = $validated['sub_category_id'];
        unset($validated['sub_category_id']);

        $grandChild = GrandChilds::query()->create($validated)->load(['category', 'subCategory']);

        return response()->json($grandChild, 201);
    }

    public function show(GrandChilds $grandChild): JsonResponse
    {
        return response()->json($grandChild->load(['category', 'subCategory']));
    }

    public function update(Request $request, GrandChilds $grandChild): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:grand_childs,slug,' . $grandChild->id],
            'sub_category_id' => ['required', 'exists:sub_categories,id'],
            'category_id' => ['nullable', 'exists:categories,id'],
        ]);

        $validated['child_id'] = $validated['sub_category_id'];
        unset($validated['sub_category_id']);

        $grandChild->update($validated);

        return response()->json($grandChild->fresh()->load(['category', 'subCategory']));
    }

    public function destroy(GrandChilds $grandChild): JsonResponse
    {
        $grandChild->delete();

        return response()->json(['message' => 'GrandChild deleted successfully']);
    }
}
