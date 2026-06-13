<?php

namespace App\Http\Controllers;

use App\Models\Features;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class FeaturesController extends Controller
{
    private function toResponseArray(Features $feature): array
    {
        $data = $feature->toArray();
        $data['icon_url'] = $feature->icon ? Storage::url($feature->icon) : null;

        return $data;
    }

    public function index(): JsonResponse
    {
        $features = Features::query()
            ->orderByRaw('COALESCE(sort_order, id) asc')
            ->orderBy('id')
            ->get()
            ->map(fn (Features $feature) => $this->toResponseArray($feature));

        return response()->json($features);
    }

    public function publicIndex(): JsonResponse
    {
        return $this->index();
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'icon' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:1024'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:1000'],
            'title_font_size' => ['nullable', 'integer', 'min:10', 'max:96'],
            'title_font_family' => ['nullable', 'string', 'max:100'],
            'description_font_size' => ['nullable', 'integer', 'min:10', 'max:72'],
            'description_font_family' => ['nullable', 'string', 'max:100'],
        ]);

        if ($request->hasFile('icon')) {
            $validated['icon'] = $request->file('icon')->store('features/icons', 'public');
        }

        $feature = Features::query()->create($validated);

        return response()->json($this->toResponseArray($feature), 201);
    }

    public function show(Features $feature): JsonResponse
    {
        return response()->json($this->toResponseArray($feature));
    }

    public function update(Request $request, Features $feature): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'icon' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:1024'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:1000'],
            'title_font_size' => ['nullable', 'integer', 'min:10', 'max:96'],
            'title_font_family' => ['nullable', 'string', 'max:100'],
            'description_font_size' => ['nullable', 'integer', 'min:10', 'max:72'],
            'description_font_family' => ['nullable', 'string', 'max:100'],
        ]);

        if ($request->hasFile('icon')) {
            if ($feature->icon) {
                Storage::disk('public')->delete($feature->icon);
            }
            $validated['icon'] = $request->file('icon')->store('features/icons', 'public');
        }

        $feature->update($validated);

        return response()->json($this->toResponseArray($feature->fresh()));
    }

    public function destroy(Features $feature): JsonResponse
    {
        if ($feature->icon) {
            Storage::disk('public')->delete($feature->icon);
        }

        $feature->delete();

        return response()->json(['message' => 'Feature deleted']);
    }
}
