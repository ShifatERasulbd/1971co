<?php

namespace App\Http\Controllers;

use App\Models\GrandChilds;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Cache;

class GrandChildController extends Controller
{
    private const INDEX_CACHE_KEY = 'grand_childs.index';

    private function clearGrandChildCache(): void
    {
        Cache::forget(self::INDEX_CACHE_KEY);
    }

    private function cachedResponse(): array
    {
        return Cache::rememberForever(self::INDEX_CACHE_KEY, function () {
            return $this->orderedGrandChildsQuery()->get()->toArray();
        });
    }

    private function orderedGrandChildsQuery()
    {
        $query = GrandChilds::query()->with(['category', 'subCategory']);

        if (Schema::hasColumn('grand_childs', 'position')) {
            return $query->orderBy('position')->orderBy('id');
        }

        return $query->orderBy('id');
    }

    public function index(): JsonResponse
    {
        return response()->json($this->cachedResponse());
    }

    public function reorder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['required', 'integer', 'exists:grand_childs,id'],
        ]);

        if (!Schema::hasColumn('grand_childs', 'position')) {
            return response()->json([
                'message' => 'Reordering is not available until the position column migration is applied.',
            ], 422);
        }

        $ids = array_values(array_unique(array_map('intval', $validated['ids'])));

        DB::transaction(function () use ($ids) {
            foreach ($ids as $index => $id) {
                GrandChilds::query()->whereKey($id)->update(['position' => $index + 1]);
            }
        });

        $grandChilds = $this->orderedGrandChildsQuery()->get();
        $this->clearGrandChildCache();
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
        $this->clearGrandChildCache();
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
        $this->clearGrandChildCache();
        return response()->json($grandChild->fresh()->load(['category', 'subCategory']));
    }

    public function destroy(GrandChilds $grandChild): JsonResponse
    {
        $grandChild->delete();
        $this->clearGrandChildCache();

        return response()->json(['message' => 'GrandChild deleted successfully']);
    }
}
