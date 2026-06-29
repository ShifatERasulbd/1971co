<?php

namespace App\Http\Controllers;

use App\Models\Feature;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;

class FeatureController extends Controller
{
    private function resolveAssetUrl(?string $asset): ?string
    {
        if (! $asset) {
            return null;
        }

        if (
            str_starts_with($asset, 'http://') ||
            str_starts_with($asset, 'https://') ||
            str_starts_with($asset, '/') ||
            str_starts_with($asset, 'data:')
        ) {
            return $asset;
        }

        return '/' . ltrim($asset, '/');
    }

    private function storeAssetInPublicDir(UploadedFile $uploadedFile, string $folder, string $prefix): string
    {
        $directory = public_path($folder);
        File::ensureDirectoryExists($directory);

        $extension = strtolower($uploadedFile->getClientOriginalExtension() ?: 'bin');
        $filename = time() . '_' . uniqid($prefix, true) . '.' . $extension;
        $uploadedFile->move($directory, $filename);

        return '/' . trim($folder, '/') . '/' . $filename;
    }

    private function deleteAssetIfLocal(?string $assetPath): void
    {
        if (! $assetPath) {
            return;
        }

        if (
            str_starts_with($assetPath, 'http://') ||
            str_starts_with($assetPath, 'https://') ||
            str_starts_with($assetPath, 'data:')
        ) {
            return;
        }

        $publicFile = public_path(ltrim($assetPath, '/'));
        if (File::exists($publicFile)) {
            @unlink($publicFile);
        }
    }

    private function validatePayload(Request $request): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'short_description' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'icon' => ['nullable', 'string', 'max:2048'],
            'icon_file' => ['nullable', 'file', 'mimes:jpeg,jpg,png,webp,avif,svg', 'max:4096'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:1000'],
            'columns_per_view' => ['nullable', 'integer', 'min:1', 'max:4'],
            'title_font_size' => ['nullable', 'integer', 'min:8', 'max:300'],
            'title_font_family' => ['nullable', 'string', 'max:100'],
            'description_font_size' => ['nullable', 'integer', 'min:8', 'max:120'],
            'description_font_family' => ['nullable', 'string', 'max:100'],
        ]);
    }

    private function toResponse(Feature $feature): array
    {
        return [
            'id' => $feature->id,
            'title' => $feature->title,
            'short_description' => $feature->short_description,
            'description' => $feature->description,
            'icon' => $feature->icon,
            'icon_url' => $this->resolveAssetUrl($feature->icon),
            'sort_order' => $feature->sort_order,
            'columns_per_view' => $feature->columns_per_view,
            'title_font_size' => $feature->title_font_size,
            'title_font_family' => $feature->title_font_family,
            'description_font_size' => $feature->description_font_size,
            'description_font_family' => $feature->description_font_family,
            'created_at' => $feature->created_at,
            'updated_at' => $feature->updated_at,
        ];
    }

    public function index(): JsonResponse
    {
        $features = Feature::query()
            ->orderByRaw('COALESCE(sort_order, id) asc')
            ->orderBy('id')
            ->get()
            ->map(fn (Feature $feature) => $this->toResponse($feature))
            ->values();

        return response()->json($features);
    }

    public function publicIndex(): JsonResponse
    {
        return $this->index();
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $this->validatePayload($request);

        if ($request->hasFile('icon_file')) {
            $validated['icon'] = $this->storeAssetInPublicDir($request->file('icon_file'), 'uploads/features/icons', 'feature_icon_');
        } elseif (array_key_exists('icon', $validated)) {
            $validated['icon'] = trim((string) $validated['icon']) ?: null;
        }

        $validated['short_description'] = trim((string) ($validated['short_description'] ?? '')) ?: null;
        $validated['description'] = trim((string) ($validated['description'] ?? $validated['short_description'] ?? '')) ?: null;

        $feature = Feature::query()->create($validated);

        return response()->json($this->toResponse($feature), 201);
    }

    public function update(Request $request, Feature $feature): JsonResponse
    {
        $validated = $this->validatePayload($request);

        if ($request->hasFile('icon_file')) {
            $this->deleteAssetIfLocal($feature->icon);
            $validated['icon'] = $this->storeAssetInPublicDir($request->file('icon_file'), 'uploads/features/icons', 'feature_icon_');
        } elseif (array_key_exists('icon', $validated)) {
            $validated['icon'] = trim((string) $validated['icon']) ?: null;
        }

        if (array_key_exists('short_description', $validated)) {
            $validated['short_description'] = trim((string) $validated['short_description']) ?: null;
        }

        if (array_key_exists('description', $validated)) {
            $validated['description'] = trim((string) $validated['description']) ?: null;
        } elseif (array_key_exists('short_description', $validated)) {
            $validated['description'] = $validated['short_description'];
        }

        $feature->update($validated);

        return response()->json($this->toResponse($feature->fresh()));
    }

    public function destroy(Feature $feature): JsonResponse
    {
        $this->deleteAssetIfLocal($feature->icon);
        $feature->delete();

        return response()->json(['success' => true]);
    }
}
