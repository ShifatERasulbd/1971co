<?php

namespace App\Http\Controllers;

use App\Models\Hero;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;

class HeroController extends Controller
{
    private function ensureDefaultHero(): Hero
    {
        $hero = Hero::query()->orderBy('id')->first();

        if (! $hero) {
            $hero = Hero::query()->create([
                'title' => 'Custom apparel solutions',
                'description' => 'Elevate your brand with premium customized apparel designed for teams, events, corporate identity, and professional wear.',
                'image' => '/uploads/heroes/images/hero1.webp',
                'video' => null,
                'title_display_mode' => 'double',
                'title_font_size' => 124,
                'title_font_family' => 'instrument-sans',
                'description_font_size' => 24,
                'description_font_family' => 'instrument-sans',
                'text_offset_x' => 0,
                'text_offset_y' => 0,
                'title_offset_x' => 0,
                'title_offset_y' => 0,
                'description_offset_x' => 0,
                'description_offset_y' => 0,
                'button_offset_x' => 0,
                'button_offset_y' => 0,
                'button_enabled' => true,
                'button_url' => '/shop',
            ]);
        }

        return $hero;
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

    private function toResponse(Hero $hero): array
    {
        return [
            'id' => $hero->id,
            'title' => $hero->title,
            'description' => $hero->description,
            'image_url' => $this->resolveAssetUrl($hero->image),
            'video_url' => $this->resolveAssetUrl($hero->video),
            'title_display_mode' => $hero->title_display_mode ?: 'double',
            'title_font_size' => $hero->title_font_size,
            'title_font_family' => $hero->title_font_family,
            'description_font_size' => $hero->description_font_size,
            'description_font_family' => $hero->description_font_family,
            'text_offset_x' => $hero->text_offset_x,
            'text_offset_y' => $hero->text_offset_y,
            'title_offset_x' => $hero->title_offset_x,
            'title_offset_y' => $hero->title_offset_y,
            'description_offset_x' => $hero->description_offset_x,
            'description_offset_y' => $hero->description_offset_y,
            'button_offset_x' => $hero->button_offset_x,
            'button_offset_y' => $hero->button_offset_y,
            'button_enabled' => (bool) $hero->button_enabled,
            'button_url' => $hero->button_url,
        ];
    }

    private function validatePayload(Request $request): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'image_url' => ['nullable', 'string'],
            'video_url' => ['nullable', 'string'],
            'image_file' => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp,avif', 'max:4096'],
            'video_file' => ['nullable', 'file', 'mimetypes:video/mp4,video/webm,video/ogg,video/quicktime', 'max:51200'],
            'title_display_mode' => ['nullable', 'in:single,double'],
            'title_font_size' => ['nullable', 'integer', 'min:8', 'max:300'],
            'title_font_family' => ['nullable', 'string', 'max:100'],
            'description_font_size' => ['nullable', 'integer', 'min:8', 'max:120'],
            'description_font_family' => ['nullable', 'string', 'max:100'],
            'text_offset_x' => ['nullable', 'integer', 'min:-100', 'max:100'],
            'text_offset_y' => ['nullable', 'integer', 'min:-100', 'max:100'],
            'title_offset_x' => ['nullable', 'integer', 'min:-100', 'max:100'],
            'title_offset_y' => ['nullable', 'integer', 'min:-100', 'max:100'],
            'description_offset_x' => ['nullable', 'integer', 'min:-100', 'max:100'],
            'description_offset_y' => ['nullable', 'integer', 'min:-100', 'max:100'],
            'button_offset_x' => ['nullable', 'integer', 'min:-100', 'max:100'],
            'button_offset_y' => ['nullable', 'integer', 'min:-100', 'max:100'],
            'button_enabled' => ['nullable', 'boolean'],
            'button_url' => ['nullable', 'string', 'max:2048'],
        ]);
    }

    public function index(): JsonResponse
    {
        $this->ensureDefaultHero();

        $heroes = Hero::query()->orderBy('id')->get()->map(fn (Hero $hero) => $this->toResponse($hero));

        return response()->json($heroes->values());
    }

    public function publicIndex(): JsonResponse
    {
        $hero = $this->ensureDefaultHero();

        return response()->json($this->toResponse($hero));
    }

    public function publicList(): JsonResponse
    {
        return $this->index();
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $this->validatePayload($request);

        if ($request->hasFile('image_file')) {
            $validated['image'] = $this->storeAssetInPublicDir($request->file('image_file'), 'uploads/heroes/images', 'hero_image_');
        } else {
            $validated['image'] = trim((string) ($validated['image_url'] ?? '')) ?: null;
        }

        if ($request->hasFile('video_file')) {
            $validated['video'] = $this->storeAssetInPublicDir($request->file('video_file'), 'uploads/heroes/videos', 'hero_video_');
        } else {
            $validated['video'] = trim((string) ($validated['video_url'] ?? '')) ?: null;
        }

        unset($validated['image_url'], $validated['video_url'], $validated['image_file'], $validated['video_file']);

        $hero = Hero::query()->create($validated);

        return response()->json($this->toResponse($hero), 201);
    }

    public function update(Request $request, Hero $hero): JsonResponse
    {
        $validated = $this->validatePayload($request);

        if ($request->hasFile('image_file')) {
            $this->deleteAssetIfLocal($hero->image);
            $validated['image'] = $this->storeAssetInPublicDir($request->file('image_file'), 'uploads/heroes/images', 'hero_image_');
        } elseif (array_key_exists('image_url', $validated)) {
            $validated['image'] = trim((string) $validated['image_url']) ?: null;
        }

        if ($request->hasFile('video_file')) {
            $this->deleteAssetIfLocal($hero->video);
            $validated['video'] = $this->storeAssetInPublicDir($request->file('video_file'), 'uploads/heroes/videos', 'hero_video_');
        } elseif (array_key_exists('video_url', $validated)) {
            $validated['video'] = trim((string) $validated['video_url']) ?: null;
        }

        unset($validated['image_url'], $validated['video_url'], $validated['image_file'], $validated['video_file']);

        $hero->update($validated);

        return response()->json($this->toResponse($hero->fresh()));
    }
}