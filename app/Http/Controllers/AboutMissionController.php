<?php

namespace App\Http\Controllers;

use App\Models\AboutMissionSection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;

class AboutMissionController extends Controller
{
    private function ensureSection(): AboutMissionSection
    {
        $section = AboutMissionSection::query()->first();

        if (!$section) {
            $section = AboutMissionSection::query()->create([
                'background_image' => '/uploads/heroes/images/hero1.webp',
                'title' => 'Our Mission',
                'description' => 'Our mission is to make personalized fashion accessible, premium, and expressive. We aim to deliver apparel that combines comfort, durability, and modern design while giving customers the freedom to create styles that represent their identity.',
                'items' => [
                    ['icon' => 'BadgeCheck', 'title' => 'Premium-Quality'],
                    ['icon' => 'SlidersHorizontal', 'title' => 'Creative Customization'],
                    ['icon' => 'Gift', 'title' => 'Long-Term Partnerships'],
                    ['icon' => 'Handshake', 'title' => 'Modern Fashion Designed'],
                ],
            ]);
        }

        return $section;
    }

    private function resolveAssetUrl(?string $asset): ?string
    {
        if (!$asset) {
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

        if (File::exists(public_path($asset))) {
            return '/' . ltrim($asset, '/');
        }

        return url('/' . ltrim($asset, '/'));
    }

    private function storeAssetInPublicDir($uploadedFile, string $folder, string $prefix): string
    {
        $directory = public_path($folder);
        File::ensureDirectoryExists($directory);

        $extension = strtolower($uploadedFile->getClientOriginalExtension() ?: 'png');
        $filename = time() . '_' . uniqid($prefix, true) . '.' . $extension;
        $uploadedFile->move($directory, $filename);

        return trim($folder, '/') . '/' . $filename;
    }

    private function deleteAssetIfLocal(?string $assetPath): void
    {
        if (!$assetPath) {
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

    private function toResponse(AboutMissionSection $section): array
    {
        $items = collect($section->items ?? [])->map(function ($item) {
            return [
                'icon' => (string) ($item['icon'] ?? 'BadgeCheck'),
                'title' => (string) ($item['title'] ?? ''),
            ];
        })->values()->all();

        return [
            'id' => $section->id,
            'background_image' => $this->resolveAssetUrl($section->background_image),
            'title' => $section->title,
            'description' => $section->description,
            'items' => $items,
        ];
    }

    public function index(): JsonResponse
    {
        $section = $this->ensureSection();

        return response()->json($this->toResponse($section));
    }

    public function publicIndex(): JsonResponse
    {
        return $this->index();
    }

    public function update(Request $request): JsonResponse
    {
        if (is_string($request->input('items'))) {
            $decodedItems = json_decode($request->input('items'), true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decodedItems)) {
                $request->merge(['items' => $decodedItems]);
            }
        }

        $validated = $request->validate([
            'background_image' => ['nullable', 'string'],
            'background_image_file' => ['nullable', 'file', 'mimes:jpeg,png,jpg,gif,webp,avif,svg', 'max:4096'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'items' => ['nullable', 'array'],
            'items.*.icon' => ['nullable', 'string', 'max:100'],
            'items.*.title' => ['nullable', 'string', 'max:255'],
        ]);

        $section = $this->ensureSection();

        $items = collect($validated['items'] ?? [])
            ->map(function ($item) {
                return [
                    'icon' => (string) ($item['icon'] ?? 'BadgeCheck'),
                    'title' => (string) ($item['title'] ?? ''),
                ];
            })
            ->filter(fn ($item) => $item['title'] !== '')
            ->values()
            ->all();

        if ($request->hasFile('background_image_file')) {
            $this->deleteAssetIfLocal($section->background_image);
            $validated['background_image'] = $this->storeAssetInPublicDir(
                $request->file('background_image_file'),
                'uploads/about/mission',
                'about_mission_'
            );
        }

        $section->update([
            'background_image' => $validated['background_image'] ?? $section->background_image,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? '',
            'items' => $items,
        ]);

        return response()->json($this->toResponse($section->fresh()));
    }
}
