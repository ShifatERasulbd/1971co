<?php

namespace App\Http\Controllers;

use App\Models\Features;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

class FeaturesController extends Controller
{
    private function storeIconInPublicDir($uploadedFile): string
    {
        $directory = public_path('fearures/icons');
        File::ensureDirectoryExists($directory);

        $extension = strtolower($uploadedFile->getClientOriginalExtension() ?: 'png');
        $filename = time() . '_' . uniqid('feature_icon_', true) . '.' . $extension;
        $uploadedFile->move($directory, $filename);

        return 'fearures/icons/' . $filename;
    }

    private function deleteIconFile(?string $iconPath): void
    {
        if (!$iconPath) {
            return;
        }

        $publicFile = public_path($iconPath);
        if (File::exists($publicFile)) {
            @unlink($publicFile);
            return;
        }

        // Backward compatibility for legacy files that were saved on storage disk.
        Storage::disk('public')->delete($iconPath);
    }

    private function resolveIconUrl(?string $icon): ?string
    {
        if (!$icon) {
            return null;
        }

        if (
            str_starts_with($icon, 'http://') ||
            str_starts_with($icon, 'https://') ||
            str_starts_with($icon, '/') ||
            str_starts_with($icon, 'data:')
        ) {
            return $icon;
        }

        if (File::exists(public_path($icon))) {
            return url('/' . ltrim($icon, '/'));
        }

        return Storage::url($icon);
    }

    private function toResponseArray(Features $feature): array
    {
        $data = $feature->toArray();
        $data['icon_url'] = $this->resolveIconUrl($feature->icon);
        $data['short_description'] = $feature->short_description ?: $feature->description;
        $data['description'] = $feature->description ?: $feature->short_description;

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
            'short_description' => ['nullable', 'string', 'required_without:description'],
            'description' => ['nullable', 'string', 'required_without:short_description'],
            'icon' => ['nullable', 'file', 'mimes:jpeg,png,jpg,gif,webp,svg', 'max:1024'],
            'icon_url' => ['nullable', 'string', 'max:65535'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:1000'],
            'columns_per_view' => ['nullable', 'integer', 'min:1', 'max:4'],
            'title_font_size' => ['nullable', 'integer', 'min:10', 'max:96'],
            'title_font_family' => ['nullable', 'string', 'max:100'],
            'description_font_size' => ['nullable', 'integer', 'min:10', 'max:72'],
            'description_font_family' => ['nullable', 'string', 'max:100'],
        ]);

        $validated['description'] = $validated['description'] ?? $validated['short_description'];
        $validated['short_description'] = $validated['short_description'] ?? $validated['description'];

        if ($request->hasFile('icon')) {
            $validated['icon'] = $this->storeIconInPublicDir($request->file('icon'));
        } elseif (!empty($validated['icon_url'])) {
            $validated['icon'] = $validated['icon_url'];
        }

        unset($validated['icon_url']);

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
            'short_description' => ['nullable', 'string', 'required_without:description'],
            'description' => ['nullable', 'string', 'required_without:short_description'],
            'icon' => ['nullable', 'file', 'mimes:jpeg,png,jpg,gif,webp,svg', 'max:1024'],
            'icon_url' => ['nullable', 'string', 'max:65535'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:1000'],
            'columns_per_view' => ['nullable', 'integer', 'min:1', 'max:4'],
            'title_font_size' => ['nullable', 'integer', 'min:10', 'max:96'],
            'title_font_family' => ['nullable', 'string', 'max:100'],
            'description_font_size' => ['nullable', 'integer', 'min:10', 'max:72'],
            'description_font_family' => ['nullable', 'string', 'max:100'],
        ]);

        $validated['description'] = $validated['description'] ?? $validated['short_description'];
        $validated['short_description'] = $validated['short_description'] ?? $validated['description'];

        if ($request->hasFile('icon')) {
            $this->deleteIconFile($feature->icon);
            $validated['icon'] = $this->storeIconInPublicDir($request->file('icon'));
        } elseif (!empty($validated['icon_url'])) {
            $validated['icon'] = $validated['icon_url'];
        }

        unset($validated['icon_url']);

        $feature->update($validated);

        return response()->json($this->toResponseArray($feature->fresh()));
    }

    public function destroy(Features $feature): JsonResponse
    {
        $this->deleteIconFile($feature->icon);

        $feature->delete();

        return response()->json(['message' => 'Feature deleted']);
    }
}
