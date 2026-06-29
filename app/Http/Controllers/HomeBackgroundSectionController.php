<?php

namespace App\Http\Controllers;

use App\Models\HomeBackgroundSection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

class HomeBackgroundSectionController extends Controller
{
    private const DEFAULT_BACKGROUND_IMAGE = '/uploads/heroes/images/hero1.webp';

    private function defaultItem(): array
    {
        return [
            'image' => self::DEFAULT_BACKGROUND_IMAGE,
            'title' => 'Built For Everyday Confidence',
            'description' => 'Elevated essentials with clean cuts, durable fabrics, and a refined streetwear silhouette.',
            'button_text' => 'Explore The Drop',
            'button_url' => '/shop',
            'show_button' => true,
        ];
    }

    private function normalizeItems($items): array
    {
        $rows = is_array($items) ? $items : [];

        $normalized = [];
        foreach ($rows as $row) {
            if (! is_array($row)) {
                continue;
            }

            $normalized[] = [
                'image' => trim((string) ($row['image'] ?? '')),
                'title' => trim((string) ($row['title'] ?? '')),
                'description' => trim((string) ($row['description'] ?? '')),
                'button_text' => trim((string) ($row['button_text'] ?? '')),
                'button_url' => trim((string) ($row['button_url'] ?? '')),
                'show_button' => filter_var($row['show_button'] ?? true, FILTER_VALIDATE_BOOL, FILTER_NULL_ON_FAILURE) ?? true,
            ];
        }

        return count($normalized) > 0 ? $normalized : [$this->defaultItem()];
    }

    private function ensureSection(): HomeBackgroundSection
    {
        $section = HomeBackgroundSection::query()->first();

        if (! $section) {
            $section = HomeBackgroundSection::query()->create([
                'background_image' => self::DEFAULT_BACKGROUND_IMAGE,
                'items' => [$this->defaultItem()],
            ]);
        } elseif (! is_array($section->items) || count($section->items) === 0) {
            $section->items = [[
                'image' => $section->background_image ?: self::DEFAULT_BACKGROUND_IMAGE,
                'title' => $this->defaultItem()['title'],
                'description' => $this->defaultItem()['description'],
                'button_text' => $this->defaultItem()['button_text'],
                'button_url' => $this->defaultItem()['button_url'],
                'show_button' => true,
            ]];
            $section->save();
        }

        return $section;
    }

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

        if (File::exists(public_path($asset))) {
            return '/' . ltrim($asset, '/');
        }

        return Storage::url($asset);
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
            return;
        }

        Storage::disk('public')->delete($assetPath);
    }

    private function toResponse(HomeBackgroundSection $section): array
    {
        $items = $this->normalizeItems($section->items);
        $items = array_map(function (array $item) {
            return [
                ...$item,
                'image' => $this->resolveAssetUrl($item['image'] ?? null) ?: self::DEFAULT_BACKGROUND_IMAGE,
            ];
        }, $items);

        $firstImage = $items[0]['image'] ?? self::DEFAULT_BACKGROUND_IMAGE;

        return [
            'id' => $section->id,
            'background_image' => $firstImage,
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
        $validated = $request->validate([
            'background_image' => ['nullable', 'string'],
            'background_image_file' => ['nullable', 'file', 'mimes:jpeg,png,jpg,gif,webp,svg,avif', 'max:8192'],
            'items' => ['nullable'],
            'item_image_files' => ['nullable', 'array'],
            'item_image_files.*' => ['nullable', 'file', 'mimes:jpeg,png,jpg,gif,webp,svg,avif', 'max:8192'],
        ]);

        $section = $this->ensureSection();

        $incomingItems = $request->input('items');
        if (is_string($incomingItems) && $incomingItems !== '') {
            $decodedItems = json_decode($incomingItems, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decodedItems)) {
                $incomingItems = $decodedItems;
            }
        }

        $items = $this->normalizeItems($incomingItems ?: $section->items);

        $itemImageFiles = $request->file('item_image_files', []);
        if (! is_array($itemImageFiles)) {
            $itemImageFiles = [];
        }

        foreach ($items as $index => $item) {
            if (! isset($itemImageFiles[$index])) {
                continue;
            }

            $oldImage = trim((string) ($items[$index]['image'] ?? ''));
            if ($oldImage !== '') {
                $this->deleteAssetIfLocal($oldImage);
            }

            $items[$index]['image'] = $this->storeAssetInPublicDir(
                $itemImageFiles[$index],
                'uploads/home/background/items',
                'home_background_item_'
            );
        }

        if ($request->hasFile('background_image_file')) {
            $this->deleteAssetIfLocal($section->background_image);
            $validated['background_image'] = $this->storeAssetInPublicDir(
                $request->file('background_image_file'),
                'uploads/home/background',
                'home_background_'
            );
        }

        if (array_key_exists('background_image', $validated) && is_string($validated['background_image'])) {
            $validated['background_image'] = trim($validated['background_image']) ?: null;
        }

        if (array_key_exists('background_image', $validated) && ! empty($validated['background_image'])) {
            $items[0]['image'] = $validated['background_image'];
        }

        $firstItemImage = trim((string) ($items[0]['image'] ?? '')) ?: self::DEFAULT_BACKGROUND_IMAGE;

        $section->update([
            'background_image' => $firstItemImage,
            'items' => $items,
        ]);

        return response()->json($this->toResponse($section->fresh()));
    }
}
